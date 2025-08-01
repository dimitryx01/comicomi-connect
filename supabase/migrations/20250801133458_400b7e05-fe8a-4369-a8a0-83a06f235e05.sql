-- Crear tabla para acciones de moderación
CREATE TABLE IF NOT EXISTS public.moderation_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_ids UUID[] NOT NULL, -- Array de IDs de reportes relacionados
  content_type TEXT NOT NULL, -- 'post', 'recipe', 'comment', etc.
  content_id UUID NOT NULL, -- ID del contenido
  action_type TEXT NOT NULL, -- 'keep', 'edit', 'delete', 'suspend_user_temp', 'suspend_user_perm'
  admin_user_id UUID NOT NULL,
  action_notes TEXT,
  content_snapshot JSONB, -- Snapshot del contenido antes de la acción
  author_id UUID, -- ID del autor del contenido
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear índices para optimización
CREATE INDEX IF NOT EXISTS idx_moderation_actions_content ON public.moderation_actions(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_admin ON public.moderation_actions(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_author ON public.moderation_actions(author_id);

-- Crear vista para reportes agrupados
CREATE OR REPLACE VIEW public.grouped_reports AS
SELECT 
  CASE 
    WHEN post_id IS NOT NULL THEN 'post'
    WHEN recipe_id IS NOT NULL THEN 'recipe'
    WHEN comment_id IS NOT NULL THEN 'comment'
    WHEN restaurant_id IS NOT NULL THEN 'restaurant'
    WHEN review_id IS NOT NULL THEN 'review'
    ELSE 'unknown'
  END as content_type,
  COALESCE(post_id, recipe_id, comment_id, restaurant_id, review_id) as content_id,
  COUNT(*) as report_count,
  array_agg(id ORDER BY created_at DESC) as report_ids,
  array_agg(DISTINCT report_type) as report_types,
  array_agg(DISTINCT reporter_id) as reporter_ids,
  MIN(created_at) as first_report_at,
  MAX(created_at) as last_report_at,
  array_agg(DISTINCT status) as statuses,
  CASE 
    WHEN COUNT(*) > 10 THEN 'critical'
    WHEN COUNT(*) > 5 THEN 'high'
    WHEN COUNT(*) > 1 THEN 'medium'
    ELSE 'low'
  END as priority_level,
  -- Verificar si ya hay una acción de moderación
  EXISTS(
    SELECT 1 FROM public.moderation_actions ma 
    WHERE ma.content_id = COALESCE(post_id, recipe_id, comment_id, restaurant_id, review_id)
    AND ma.content_type = CASE 
      WHEN post_id IS NOT NULL THEN 'post'
      WHEN recipe_id IS NOT NULL THEN 'recipe'
      WHEN comment_id IS NOT NULL THEN 'comment'
      WHEN restaurant_id IS NOT NULL THEN 'restaurant'
      WHEN review_id IS NOT NULL THEN 'review'
      ELSE 'unknown'
    END
  ) as has_moderation_action
FROM public.reports
WHERE 
  (post_id IS NOT NULL OR recipe_id IS NOT NULL OR comment_id IS NOT NULL OR restaurant_id IS NOT NULL OR review_id IS NOT NULL)
GROUP BY 
  CASE 
    WHEN post_id IS NOT NULL THEN 'post'
    WHEN recipe_id IS NOT NULL THEN 'recipe'
    WHEN comment_id IS NOT NULL THEN 'comment'
    WHEN restaurant_id IS NOT NULL THEN 'restaurant'
    WHEN review_id IS NOT NULL THEN 'review'
    ELSE 'unknown'
  END,
  COALESCE(post_id, recipe_id, comment_id, restaurant_id, review_id);

-- Función para obtener detalles del contenido reportado con información del autor
CREATE OR REPLACE FUNCTION public.get_reported_content_details(
  p_content_type TEXT,
  p_content_id UUID
)
RETURNS JSONB
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT CASE p_content_type
    WHEN 'post' THEN (
      SELECT jsonb_build_object(
        'id', p.id,
        'content', p.content,
        'media_urls', p.media_urls,
        'location', p.location,
        'created_at', p.created_at,
        'is_public', p.is_public,
        'author', jsonb_build_object(
          'id', u.id,
          'full_name', u.full_name,
          'username', u.username,
          'avatar_url', u.avatar_url,
          'email', u.email
        )
      )
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
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
        'author', jsonb_build_object(
          'id', u.id,
          'full_name', u.full_name,
          'username', u.username,
          'avatar_url', u.avatar_url,
          'email', u.email
        )
      )
      FROM recipes r
      LEFT JOIN users u ON r.author_id = u.id
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
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
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
      FROM restaurants r
      WHERE r.id = p_content_id
    )
    ELSE NULL
  END;
$$;

-- RLS para moderation_actions
ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can view moderation actions"
ON public.moderation_actions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM admin_user_roles
    WHERE admin_user_id = auth.uid()
    AND role IN ('admin_master', 'moderador_contenido')
  )
);

CREATE POLICY "Admin users can create moderation actions"
ON public.moderation_actions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_user_roles
    WHERE admin_user_id = auth.uid()
    AND role IN ('admin_master', 'moderador_contenido')
  )
  AND admin_user_id = auth.uid()
);