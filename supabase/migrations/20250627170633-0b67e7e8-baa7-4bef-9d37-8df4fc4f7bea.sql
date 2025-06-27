
-- Create table for recipe comments (independent from post comments)
CREATE TABLE public.recipe_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES public.recipe_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for recipe cheers (independent from post cheers)
CREATE TABLE public.recipe_cheers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(recipe_id, user_id)
);

-- Enable RLS for recipe comments
ALTER TABLE public.recipe_comments ENABLE ROW LEVEL SECURITY;

-- RLS policies for recipe comments
CREATE POLICY "Users can view all recipe comments" 
  ON public.recipe_comments FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create recipe comments" 
  ON public.recipe_comments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipe comments" 
  ON public.recipe_comments FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipe comments" 
  ON public.recipe_comments FOR DELETE 
  USING (auth.uid() = user_id);

-- Enable RLS for recipe cheers
ALTER TABLE public.recipe_cheers ENABLE ROW LEVEL SECURITY;

-- RLS policies for recipe cheers
CREATE POLICY "Users can view all recipe cheers" 
  ON public.recipe_cheers FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage their recipe cheers" 
  ON public.recipe_cheers FOR ALL 
  USING (auth.uid() = user_id);

-- Function to get recipe comments with user info
CREATE OR REPLACE FUNCTION get_recipe_comments(recipe_uuid uuid)
RETURNS TABLE (
  id uuid,
  content text,
  created_at timestamptz,
  user_id uuid,
  user_full_name text,
  user_username text,
  user_avatar_url text,
  cheers_count integer
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    c.id,
    c.content,
    c.created_at,
    c.user_id,
    u.full_name,
    u.username,
    u.avatar_url,
    0::integer as cheers_count -- Por ahora sin cheers en comentarios de recetas
  FROM public.recipe_comments c
  LEFT JOIN public.users u ON c.user_id = u.id
  WHERE c.recipe_id = recipe_uuid
  ORDER BY c.created_at ASC;
$$;

-- Function to get recipe comments count
CREATE OR REPLACE FUNCTION get_recipe_comments_count(recipe_uuid uuid)
RETURNS integer
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*)::integer
  FROM public.recipe_comments
  WHERE recipe_id = recipe_uuid;
$$;

-- Update the existing get_recipe_by_id function to use recipe_comments instead of comments
CREATE OR REPLACE FUNCTION public.get_recipe_by_id(recipe_uuid uuid)
RETURNS TABLE(id uuid, title text, description text, image_url text, youtube_url text, author_id uuid, author_name text, author_username text, author_avatar_url text, prep_time integer, cook_time integer, total_time integer, servings integer, cuisine_type text, difficulty text, ingredients jsonb, steps jsonb, allergens text[], tags text[], recipe_interests text[], created_at timestamp with time zone, cheers_count integer, saves_count integer, comments_count integer)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    r.id,
    r.title,
    r.description,
    r.image_url,
    r.youtube_url,
    r.author_id,
    u.full_name as author_name,
    u.username as author_username,
    u.avatar_url as author_avatar_url,
    r.prep_time,
    r.cook_time,
    r.total_time,
    r.servings,
    r.cuisine_type,
    r.difficulty,
    r.ingredients,
    r.steps,
    r.allergens,
    r.tags,
    r.recipe_interests,
    r.created_at,
    COALESCE(cheers_data.count, 0)::integer as cheers_count,
    COALESCE(saves_data.count, 0)::integer as saves_count,
    COALESCE(comments_data.count, 0)::integer as comments_count
  FROM public.recipes r
  LEFT JOIN public.users u ON r.author_id = u.id
  LEFT JOIN (
    SELECT recipe_id, COUNT(*) as count
    FROM public.recipe_cheers
    GROUP BY recipe_id
  ) cheers_data ON r.id = cheers_data.recipe_id
  LEFT JOIN (
    SELECT recipe_id, COUNT(*) as count
    FROM public.saved_recipes
    GROUP BY recipe_id
  ) saves_data ON r.id = saves_data.recipe_id
  LEFT JOIN (
    SELECT recipe_id, COUNT(*) as count
    FROM public.recipe_comments
    GROUP BY recipe_id
  ) comments_data ON r.id = comments_data.recipe_id
  WHERE r.id = recipe_uuid AND r.is_public = true;
$function$;

-- Update the get_recipes_with_author_info function to use recipe_cheers and recipe_comments
CREATE OR REPLACE FUNCTION public.get_recipes_with_author_info()
RETURNS TABLE(id uuid, title text, description text, image_url text, youtube_url text, author_id uuid, author_name text, author_username text, author_avatar_url text, prep_time integer, cook_time integer, total_time integer, servings integer, cuisine_type text, difficulty text, ingredients jsonb, steps jsonb, allergens text[], tags text[], recipe_interests text[], created_at timestamp with time zone, cheers_count integer, saves_count integer)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    r.id,
    r.title,
    r.description,
    r.image_url,
    r.youtube_url,
    r.author_id,
    u.full_name as author_name,
    u.username as author_username,
    u.avatar_url as author_avatar_url,
    r.prep_time,
    r.cook_time,
    r.total_time,
    r.servings,
    r.cuisine_type,
    r.difficulty,
    r.ingredients,
    r.steps,
    r.allergens,
    r.tags,
    r.recipe_interests,
    r.created_at,
    COALESCE(cheers_data.count, 0)::integer as cheers_count,
    COALESCE(saves_data.count, 0)::integer as saves_count
  FROM public.recipes r
  LEFT JOIN public.users u ON r.author_id = u.id
  LEFT JOIN (
    SELECT recipe_id, COUNT(*) as count
    FROM public.recipe_cheers
    GROUP BY recipe_id
  ) cheers_data ON r.id = cheers_data.recipe_id
  LEFT JOIN (
    SELECT recipe_id, COUNT(*) as count
    FROM public.saved_recipes
    GROUP BY recipe_id
  ) saves_data ON r.id = saves_data.recipe_id
  WHERE r.is_public = true
  ORDER BY r.created_at DESC;
$function$;
