
-- 1) Nuevo campo is_reported en posts y recipes (sin romper lo existente)
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS is_reported boolean NOT NULL DEFAULT false;

ALTER TABLE public.recipes
  ADD COLUMN IF NOT EXISTS is_reported boolean NOT NULL DEFAULT false;

-- 2) Triggers para sincronizar is_reported -> is_public (compatibilidad total)
CREATE OR REPLACE FUNCTION public.sync_is_reported_posts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $func$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.is_reported THEN
      NEW.is_public := false;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Cambios explícitos en is_reported dominan is_public
    IF NEW.is_reported IS DISTINCT FROM OLD.is_reported THEN
      NEW.is_public := NOT NEW.is_reported;
    END IF;

    -- Si queda reportado, forzar oculto
    IF NEW.is_reported THEN
      NEW.is_public := false;
    END IF;

    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$func$;

DROP TRIGGER IF EXISTS trg_sync_is_reported_posts ON public.posts;
CREATE TRIGGER trg_sync_is_reported_posts
BEFORE INSERT OR UPDATE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.sync_is_reported_posts();

CREATE OR REPLACE FUNCTION public.sync_is_reported_recipes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $func$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.is_reported THEN
      NEW.is_public := false;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.is_reported IS DISTINCT FROM OLD.is_reported THEN
      NEW.is_public := NOT NEW.is_reported;
    END IF;

    IF NEW.is_reported THEN
      NEW.is_public := false;
    END IF;

    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$func$;

DROP TRIGGER IF EXISTS trg_sync_is_reported_recipes ON public.recipes;
CREATE TRIGGER trg_sync_is_reported_recipes
BEFORE INSERT OR UPDATE ON public.recipes
FOR EACH ROW
EXECUTE FUNCTION public.sync_is_reported_recipes();

-- 3) Ampliar el RPC de detalles para incluir is_reported (no rompe firma JSON)
CREATE OR REPLACE FUNCTION public.get_reported_content_details(p_content_type text, p_content_id uuid)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT CASE p_content_type
    WHEN 'post' THEN (
      SELECT jsonb_build_object(
        'id', p.id,
        'content', p.content,
        'media_urls', p.media_urls,
        'location', p.location,
        'created_at', p.created_at,
        'is_public', p.is_public,
        'is_reported', p.is_reported,
        'author', jsonb_build_object(
          'id', u.id,
          'full_name', u.full_name,
          'username', u.username,
          'avatar_url', u.avatar_url,
          'email', u.email
        )
      )
      FROM public.posts p
      LEFT JOIN public.users u ON p.author_id = u.id
      WHERE p.id = p_content_id
    )
    WHEN 'recipe' THEN (
      SELECT jsonb_build_object(
        'id', r.id,
        'title', r.title,
        'description', r.description,
        'image_url', r.image_url,
        'created_at', r.created_at,
        'is_public', r.is_public,
        'is_reported', r.is_reported,
        'author', jsonb_build_object(
          'id', u.id,
          'full_name', u.full_name,
          'username', u.username,
          'avatar_url', u.avatar_url,
          'email', u.email
        )
      )
      FROM public.recipes r
      LEFT JOIN public.users u ON r.author_id = u.id
      WHERE r.id = p_content_id
    )
    WHEN 'comment' THEN (
      SELECT jsonb_build_object(
        'id', c.id,
        'content', c.content,
        'created_at', c.created_at,
        'post_id', c.post_id,
        'recipe_id', c.recipe_id,
        'author', jsonb_build_object(
          'id', u.id,
          'full_name', u.full_name,
          'username', u.username,
          'avatar_url', u.avatar_url,
          'email', u.email
        )
      )
      FROM public.comments c
      LEFT JOIN public.users u ON c.user_id = u.id
      WHERE c.id = p_content_id
    )
    WHEN 'restaurant' THEN (
      SELECT jsonb_build_object(
        'id', r.id,
        'name', r.name,
        'description', r.description,
        'location', r.location,
        'image_url', r.image_url,
        'cover_image_url', r.cover_image_url,
        'created_at', r.created_at
      )
      FROM public.restaurants r
      WHERE r.id = p_content_id
    )
    ELSE NULL
  END;
$function$;

-- 4) Catálogo de motivos predefinidos para clasificar acciones de moderación
CREATE TABLE IF NOT EXISTS public.moderation_reasons (
  code text PRIMARY KEY,
  label text NOT NULL,
  description text,
  category text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Semillas iniciales (idempotentes)
INSERT INTO public.moderation_reasons (code, label, category, description)
VALUES
('spam', 'Spam', 'Safety', 'Contenido no deseado o repetitivo'),
('hate_speech', 'Discurso de odio', 'Safety', 'Ataques a grupos protegidos'),
('harassment', 'Acoso', 'Safety', 'Acoso o bullying'),
('graphic_violence', 'Violencia gráfica', 'Safety', 'Contenido violento o gráfico'),
('sexual_content', 'Contenido sexual', 'Safety', 'Contenido sexual explícito'),
('misinformation', 'Desinformación', 'Integrity', 'Información engañosa'),
('personal_data', 'Datos personales', 'Privacy', 'Exposición de datos personales'),
('illegal_goods', 'Bienes/servicios ilegales', 'Legal', 'Promoción de actividades ilegales'),
('phishing', 'Phishing o fraude', 'Security', 'Intentos de estafa o phishing'),
('other', 'Otro', 'General', 'Otro motivo no clasificado')
ON CONFLICT (code) DO NOTHING;

-- 5) Ampliar moderation_actions para auditoría detallada y motivo
ALTER TABLE public.moderation_actions
  ADD COLUMN IF NOT EXISTS reason_code text REFERENCES public.moderation_reasons(code),
  ADD COLUMN IF NOT EXISTS previous_state jsonb,
  ADD COLUMN IF NOT EXISTS new_state jsonb;

-- 6) RPC para historia de moderación detallada (para UI del panel y auditoría)
CREATE OR REPLACE FUNCTION public.get_moderation_history(p_content_type text, p_content_id uuid)
RETURNS TABLE(
  id uuid,
  action_type text,
  action_notes text,
  created_at timestamptz,
  admin_user_id uuid,
  admin_name text,
  reason_code text,
  reason_label text,
  previous_state jsonb,
  new_state jsonb
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    ma.id,
    ma.action_type,
    ma.action_notes,
    ma.created_at,
    ma.admin_user_id,
    au.full_name as admin_name,
    ma.reason_code,
    mr.label as reason_label,
    ma.previous_state,
    ma.new_state
  FROM public.moderation_actions ma
  LEFT JOIN public.admin_users au ON au.id = ma.admin_user_id
  LEFT JOIN public.moderation_reasons mr ON mr.code = ma.reason_code
  WHERE ma.content_type = p_content_type
    AND ma.content_id = p_content_id
  ORDER BY ma.created_at DESC;
$function$;
