
-- Crear tabla para el sistema de seguidores (usuarios y restaurantes)
CREATE TABLE public.user_follows (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  followed_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  followed_restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  
  -- Constraint para asegurar que se siga solo a un usuario O restaurante, no ambos
  CONSTRAINT follow_target_check CHECK (
    (followed_user_id IS NOT NULL AND followed_restaurant_id IS NULL) OR
    (followed_user_id IS NULL AND followed_restaurant_id IS NOT NULL)
  ),
  
  -- Evitar duplicados de seguimiento
  CONSTRAINT unique_user_follow UNIQUE(follower_id, followed_user_id),
  CONSTRAINT unique_restaurant_follow UNIQUE(follower_id, followed_restaurant_id)
);

-- Habilitar RLS en la tabla user_follows
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_follows
CREATE POLICY "Users can view all follows" 
  ON public.user_follows 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can manage their own follows" 
  ON public.user_follows 
  FOR INSERT 
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follows" 
  ON public.user_follows 
  FOR DELETE 
  USING (auth.uid() = follower_id);

-- Crear índices para optimizar consultas
CREATE INDEX idx_user_follows_follower ON public.user_follows(follower_id);
CREATE INDEX idx_user_follows_followed_user ON public.user_follows(followed_user_id);
CREATE INDEX idx_user_follows_followed_restaurant ON public.user_follows(followed_restaurant_id);

-- Función corregida para obtener el feed personalizado unificado
CREATE OR REPLACE FUNCTION public.get_personalized_unified_feed(
  user_uuid uuid,
  page_size integer DEFAULT 10,
  page_offset integer DEFAULT 0
)
RETURNS TABLE(
  content_type text,
  content_id uuid,
  content_data jsonb,
  relevance_score numeric,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  WITH user_interests AS (
    SELECT COALESCE(array_agg(i.name), ARRAY[]::text[]) as interests
    FROM user_interests ui
    JOIN interests i ON ui.interest_id = i.id
    WHERE ui.user_id = user_uuid
  ),
  followed_users AS (
    SELECT COALESCE(array_agg(followed_user_id), ARRAY[]::uuid[]) as user_ids
    FROM user_follows
    WHERE follower_id = user_uuid AND followed_user_id IS NOT NULL
  ),
  followed_restaurants AS (
    SELECT COALESCE(array_agg(followed_restaurant_id), ARRAY[]::uuid[]) as restaurant_ids
    FROM user_follows
    WHERE follower_id = user_uuid AND followed_restaurant_id IS NOT NULL
  ),
  -- Posts de usuarios seguidos
  followed_posts AS (
    SELECT 
      'post' as content_type,
      p.id as content_id,
      jsonb_build_object(
        'id', p.id,
        'content', p.content,
        'author_id', p.author_id,
        'author_name', u.full_name,
        'author_username', u.username,
        'author_avatar', u.avatar_url,
        'media_urls', p.media_urls,
        'location', p.location,
        'restaurant_id', p.restaurant_id,
        'restaurant_name', r.name,
        'created_at', p.created_at
      ) as content_data,
      50 as relevance_score,
      p.created_at
    FROM posts p
    JOIN users u ON p.author_id = u.id
    LEFT JOIN restaurants r ON p.restaurant_id = r.id
    CROSS JOIN followed_users fu
    WHERE (array_length(fu.user_ids, 1) IS NULL OR p.author_id = ANY(fu.user_ids))
      AND p.is_public = true
      AND array_length(fu.user_ids, 1) > 0
  ),
  -- Shared posts de usuarios seguidos
  followed_shared_posts AS (
    SELECT 
      'shared_post' as content_type,
      sp.id as content_id,
      jsonb_build_object(
        'id', sp.id,
        'sharer_id', sp.sharer_id,
        'shared_type', sp.shared_type,
        'comment', sp.comment,
        'sharer_name', u.full_name,
        'sharer_username', u.username,
        'sharer_avatar', u.avatar_url,
        'created_at', sp.created_at
      ) as content_data,
      45 as relevance_score,
      sp.created_at
    FROM shared_posts sp
    JOIN users u ON sp.sharer_id = u.id
    CROSS JOIN followed_users fu
    WHERE (array_length(fu.user_ids, 1) IS NULL OR sp.sharer_id = ANY(fu.user_ids))
      AND array_length(fu.user_ids, 1) > 0
  ),
  -- Recetas de usuarios seguidos
  followed_recipes AS (
    SELECT 
      'recipe' as content_type,
      r.id as content_id,
      jsonb_build_object(
        'id', r.id,
        'title', r.title,
        'description', r.description,
        'image_url', r.image_url,
        'author_id', r.author_id,
        'author_name', u.full_name,
        'author_username', u.username,
        'author_avatar', u.avatar_url,
        'cuisine_type', r.cuisine_type,
        'difficulty', r.difficulty,
        'prep_time', r.prep_time,
        'cook_time', r.cook_time,
        'created_at', r.created_at
      ) as content_data,
      45 as relevance_score,
      r.created_at
    FROM recipes r
    JOIN users u ON r.author_id = u.id
    CROSS JOIN followed_users fu
    WHERE (array_length(fu.user_ids, 1) IS NULL OR r.author_id = ANY(fu.user_ids))
      AND r.is_public = true
      AND array_length(fu.user_ids, 1) > 0
  ),
  -- Contenido aleatorio basado en intereses (solo si no hay suficiente contenido de seguidos)
  interest_based_content AS (
    SELECT 
      'post' as content_type,
      p.id as content_id,
      jsonb_build_object(
        'id', p.id,
        'content', p.content,
        'author_id', p.author_id,
        'author_name', u.full_name,
        'author_username', u.username,
        'author_avatar', u.avatar_url,
        'media_urls', p.media_urls,
        'location', p.location,
        'restaurant_id', p.restaurant_id,
        'restaurant_name', r.name,
        'created_at', p.created_at
      ) as content_data,
      CASE 
        WHEN p.created_at > now() - interval '1 day' THEN 35
        WHEN p.created_at > now() - interval '7 days' THEN 25
        ELSE 15
      END as relevance_score,
      p.created_at
    FROM posts p
    JOIN users u ON p.author_id = u.id
    LEFT JOIN restaurants r ON p.restaurant_id = r.id
    CROSS JOIN followed_users fu
    WHERE p.is_public = true
      AND (array_length(fu.user_ids, 1) IS NULL OR p.author_id != ALL(fu.user_ids))
      AND p.author_id != user_uuid
    ORDER BY random()
    LIMIT 15
  ),
  -- Recetas aleatorias basadas en intereses
  interest_based_recipes AS (
    SELECT 
      'recipe' as content_type,
      r.id as content_id,
      jsonb_build_object(
        'id', r.id,
        'title', r.title,
        'description', r.description,
        'image_url', r.image_url,
        'author_id', r.author_id,
        'author_name', u.full_name,
        'author_username', u.username,
        'author_avatar', u.avatar_url,
        'cuisine_type', r.cuisine_type,
        'difficulty', r.difficulty,
        'prep_time', r.prep_time,
        'cook_time', r.cook_time,
        'created_at', r.created_at
      ) as content_data,
      30 as relevance_score,
      r.created_at
    FROM recipes r
    JOIN users u ON r.author_id = u.id
    CROSS JOIN followed_users fu
    WHERE r.is_public = true
      AND (array_length(fu.user_ids, 1) IS NULL OR r.author_id != ALL(fu.user_ids))
      AND r.author_id != user_uuid
    ORDER BY random()
    LIMIT 10
  )
  
  -- Unificar todo el contenido y aplicar paginación
  SELECT * FROM followed_posts
  UNION ALL
  SELECT * FROM followed_shared_posts
  UNION ALL
  SELECT * FROM followed_recipes
  UNION ALL
  SELECT * FROM interest_based_content
  UNION ALL
  SELECT * FROM interest_based_recipes
  
  ORDER BY relevance_score DESC, created_at DESC
  LIMIT page_size
  OFFSET page_offset;
$$;

-- ... keep existing code (funciones de conteo y verificación) the same ...
