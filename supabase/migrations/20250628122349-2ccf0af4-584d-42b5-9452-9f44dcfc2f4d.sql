
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

-- Función para obtener el feed personalizado unificado
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
    SELECT array_agg(i.name) as interests
    FROM user_interests ui
    JOIN interests i ON ui.interest_id = i.id
    WHERE ui.user_id = user_uuid
  ),
  followed_users AS (
    SELECT followed_user_id
    FROM user_follows
    WHERE follower_id = user_uuid AND followed_user_id IS NOT NULL
  ),
  followed_restaurants AS (
    SELECT followed_restaurant_id
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
        'recipe_id', p.recipe_id,
        'created_at', p.created_at
      ) as content_data,
      50 as relevance_score, -- Alta relevancia por seguimiento
      p.created_at
    FROM posts p
    JOIN users u ON p.author_id = u.id
    WHERE p.author_id IN (SELECT followed_user_id FROM followed_users)
      AND p.is_public = true
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
    WHERE sp.sharer_id IN (SELECT followed_user_id FROM followed_users)
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
    WHERE r.author_id IN (SELECT followed_user_id FROM followed_users)
      AND r.is_public = true
  ),
  -- Contenido aleatorio basado en intereses
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
        'recipe_id', p.recipe_id,
        'created_at', p.created_at
      ) as content_data,
      CASE 
        WHEN p.created_at > now() - interval '1 day' THEN 35 -- Contenido reciente
        WHEN p.created_at > now() - interval '7 days' THEN 25
        ELSE 15
      END as relevance_score,
      p.created_at
    FROM posts p
    JOIN users u ON p.author_id = u.id
    WHERE p.is_public = true
      AND p.author_id NOT IN (SELECT followed_user_id FROM followed_users WHERE followed_user_id IS NOT NULL)
      AND p.author_id != user_uuid
    ORDER BY random()
    LIMIT 20
  )
  
  -- Unificar todo el contenido
  SELECT * FROM followed_posts
  UNION ALL
  SELECT * FROM followed_shared_posts
  UNION ALL
  SELECT * FROM followed_recipes
  UNION ALL
  SELECT * FROM interest_based_content
  
  ORDER BY relevance_score DESC, created_at DESC
  LIMIT page_size
  OFFSET page_offset;
$$;

-- Función para contar seguidores de usuario
CREATE OR REPLACE FUNCTION public.count_user_followers(target_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer
  FROM user_follows
  WHERE followed_user_id = target_user_id;
$$;

-- Función para contar seguidos de usuario
CREATE OR REPLACE FUNCTION public.count_user_following(user_uuid uuid)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer
  FROM user_follows
  WHERE follower_id = user_uuid;
$$;

-- Función para contar seguidores de restaurante
CREATE OR REPLACE FUNCTION public.count_restaurant_followers(restaurant_uuid uuid)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer
  FROM user_follows
  WHERE followed_restaurant_id = restaurant_uuid;
$$;

-- Función para verificar si un usuario sigue a otro usuario
CREATE OR REPLACE FUNCTION public.is_following_user(follower_uuid uuid, target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1
    FROM user_follows
    WHERE follower_id = follower_uuid AND followed_user_id = target_user_id
  );
$$;

-- Función para verificar si un usuario sigue a un restaurante
CREATE OR REPLACE FUNCTION public.is_following_restaurant(follower_uuid uuid, restaurant_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1
    FROM user_follows
    WHERE follower_id = follower_uuid AND followed_restaurant_id = restaurant_uuid
  );
$$;
