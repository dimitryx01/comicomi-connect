
-- Corregir función get_shared_post_comments con search_path seguro
CREATE OR REPLACE FUNCTION public.get_shared_post_comments(shared_post_uuid uuid)
RETURNS TABLE(
  id uuid, 
  content text, 
  created_at timestamp with time zone, 
  user_id uuid, 
  user_full_name text, 
  user_username text, 
  user_avatar_url text, 
  cheers_count integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT 
    c.id,
    c.content,
    c.created_at,
    c.user_id,
    u.full_name,
    u.username,
    u.avatar_url,
    0::integer as cheers_count -- Por ahora sin cheers en comentarios
  FROM public.shared_post_comments c
  LEFT JOIN public.users u ON c.user_id = u.id
  WHERE c.shared_post_id = shared_post_uuid
  ORDER BY c.created_at ASC;
$function$;

-- Corregir función get_shared_post_comments_count con search_path seguro
CREATE OR REPLACE FUNCTION public.get_shared_post_comments_count(shared_post_uuid uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT COUNT(*)::integer
  FROM public.shared_post_comments
  WHERE shared_post_id = shared_post_uuid;
$function$;

-- Corregir función get_post_comments_count con search_path seguro
CREATE OR REPLACE FUNCTION public.get_post_comments_count(post_uuid uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT COUNT(*)::integer
  FROM public.comments
  WHERE post_id = post_uuid;
$function$;

-- Corregir función get_post_comments con search_path seguro
CREATE OR REPLACE FUNCTION public.get_post_comments(post_uuid uuid)
RETURNS TABLE(
  id uuid, 
  content text, 
  created_at timestamp with time zone, 
  user_id uuid, 
  user_full_name text, 
  user_username text, 
  user_avatar_url text, 
  cheers_count integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT 
    c.id,
    c.content,
    c.created_at,
    c.user_id,
    u.full_name,
    u.username,
    u.avatar_url,
    COALESCE(cheer_counts.count, 0)::integer as cheers_count
  FROM public.comments c
  LEFT JOIN public.users u ON c.user_id = u.id
  LEFT JOIN (
    SELECT comment_id, COUNT(*) as count
    FROM public.comment_cheers
    GROUP BY comment_id
  ) cheer_counts ON c.id = cheer_counts.comment_id
  WHERE c.post_id = post_uuid
  ORDER BY c.created_at ASC;
$function$;
