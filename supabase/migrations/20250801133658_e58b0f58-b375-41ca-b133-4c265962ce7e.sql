-- Corregir la función get_reported_content_details con search_path
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
$$;

-- Corregir la función get_grouped_reports con search_path
CREATE OR REPLACE FUNCTION public.get_grouped_reports()
RETURNS TABLE (
  content_type TEXT,
  content_id UUID,
  report_count BIGINT,
  report_ids UUID[],
  report_types TEXT[],
  reporter_ids UUID[],
  first_report_at TIMESTAMP WITH TIME ZONE,
  last_report_at TIMESTAMP WITH TIME ZONE,
  statuses TEXT[],
  priority_level TEXT,
  has_moderation_action BOOLEAN
)
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    content_type_calc as content_type,
    content_id_calc as content_id,
    COUNT(*) as report_count,
    array_agg(r.id ORDER BY r.created_at DESC) as report_ids,
    array_agg(DISTINCT r.report_type) as report_types,
    array_agg(DISTINCT r.reporter_id) as reporter_ids,
    MIN(r.created_at) as first_report_at,
    MAX(r.created_at) as last_report_at,
    array_agg(DISTINCT r.status) as statuses,
    CASE 
      WHEN COUNT(*) > 10 THEN 'critical'
      WHEN COUNT(*) > 5 THEN 'high'
      WHEN COUNT(*) > 1 THEN 'medium'
      ELSE 'low'
    END as priority_level,
    EXISTS(
      SELECT 1 FROM public.moderation_actions ma 
      WHERE ma.content_id = content_id_calc
      AND ma.content_type = content_type_calc
    ) as has_moderation_action
  FROM (
    SELECT 
      r.*,
      CASE 
        WHEN r.post_id IS NOT NULL THEN 'post'
        WHEN r.recipe_id IS NOT NULL THEN 'recipe'
        WHEN r.comment_id IS NOT NULL THEN 'comment'
        WHEN r.restaurant_id IS NOT NULL THEN 'restaurant'
        WHEN r.review_id IS NOT NULL THEN 'review'
        ELSE 'unknown'
      END as content_type_calc,
      COALESCE(r.post_id, r.recipe_id, r.comment_id, r.restaurant_id, r.review_id) as content_id_calc
    FROM public.reports r
    WHERE 
      (r.post_id IS NOT NULL OR r.recipe_id IS NOT NULL OR r.comment_id IS NOT NULL OR r.restaurant_id IS NOT NULL OR r.review_id IS NOT NULL)
  ) r
  GROUP BY content_type_calc, content_id_calc
  ORDER BY COUNT(*) DESC, MAX(r.created_at) DESC;
$$;