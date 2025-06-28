
-- Corregir la función get_personalized_unified_feed para cargar contenido original
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
  -- Shared posts de usuarios seguidos CON contenido original
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
        'created_at', sp.created_at,
        'original_content', CASE 
          WHEN sp.shared_type = 'post' AND sp.shared_post_id IS NOT NULL THEN
            jsonb_build_object(
              'id', op.id,
              'content', op.content,
              'media_urls', op.media_urls,
              'location', op.location,
              'author', jsonb_build_object(
                'id', opu.id,
                'full_name', opu.full_name,
                'username', opu.username,
                'avatar_url', opu.avatar_url
              ),
              'restaurant_id', op.restaurant_id,
              'created_at', op.created_at
            )
          WHEN sp.shared_type = 'recipe' AND sp.shared_recipe_id IS NOT NULL THEN
            jsonb_build_object(
              'id', or_.id,
              'title', or_.title,
              'description', or_.description,
              'image_url', or_.image_url,
              'author', jsonb_build_object(
                'id', oru.id,
                'full_name', oru.full_name,
                'username', oru.username,
                'avatar_url', oru.avatar_url
              ),
              'prep_time', or_.prep_time,
              'cook_time', or_.cook_time,
              'difficulty', or_.difficulty,
              'created_at', or_.created_at
            )
          WHEN sp.shared_type = 'restaurant' AND sp.shared_restaurant_id IS NOT NULL THEN
            jsonb_build_object(
              'id', orst.id,
              'name', orst.name,
              'description', orst.description,
              'cover_image_url', orst.cover_image_url,
              'location', orst.location,
              'cuisine_type', orst.cuisine_type,
              'created_at', orst.created_at
            )
          ELSE NULL
        END
      ) as content_data,
      45 as relevance_score,
      sp.created_at
    FROM shared_posts sp
    JOIN users u ON sp.sharer_id = u.id
    LEFT JOIN posts op ON sp.shared_post_id = op.id AND sp.shared_type = 'post'
    LEFT JOIN users opu ON op.author_id = opu.id
    LEFT JOIN recipes or_ ON sp.shared_recipe_id = or_.id AND sp.shared_type = 'recipe'
    LEFT JOIN users oru ON or_.author_id = oru.id
    LEFT JOIN restaurants orst ON sp.shared_restaurant_id = orst.id AND sp.shared_type = 'restaurant'
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

-- Función para obtener restaurantes aleatorios por ciudad
CREATE OR REPLACE FUNCTION public.get_random_restaurants_by_city(
  user_city text,
  limit_count integer DEFAULT 8
)
RETURNS TABLE(
  id uuid,
  name text,
  description text,
  image_url text,
  cover_image_url text,
  location text,
  cuisine_type text,
  followers_count integer
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    r.id,
    r.name,
    r.description,
    r.image_url,
    r.cover_image_url,
    r.location,
    r.cuisine_type,
    COALESCE(f.followers_count, 0)::integer as followers_count
  FROM restaurants r
  LEFT JOIN (
    SELECT 
      followed_restaurant_id,
      COUNT(*) as followers_count
    FROM user_follows
    WHERE followed_restaurant_id IS NOT NULL
    GROUP BY followed_restaurant_id
  ) f ON r.id = f.followed_restaurant_id
  WHERE r.location ILIKE '%' || user_city || '%'
    OR r.address ILIKE '%' || user_city || '%'
  ORDER BY random()
  LIMIT limit_count;
$$;
