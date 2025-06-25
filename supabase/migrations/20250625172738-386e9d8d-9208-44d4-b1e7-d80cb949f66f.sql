
-- Actualizar la tabla de recetas para incluir campos faltantes
ALTER TABLE public.recipes 
ADD COLUMN IF NOT EXISTS youtube_url TEXT,
ADD COLUMN IF NOT EXISTS recipe_interests TEXT[]; -- Para almacenar los IDs de intereses relacionados

-- Crear índices para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_recipes_youtube_url ON public.recipes(youtube_url) WHERE youtube_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_recipes_recipe_interests ON public.recipes USING GIN(recipe_interests);
CREATE INDEX IF NOT EXISTS idx_recipes_created_at_desc ON public.recipes(created_at DESC);

-- Función para obtener recetas con información del autor
CREATE OR REPLACE FUNCTION get_recipes_with_author_info()
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  image_url text,
  youtube_url text,
  author_id uuid,
  author_name text,
  author_username text,
  author_avatar_url text,
  prep_time integer,
  cook_time integer,
  total_time integer,
  servings integer,
  cuisine_type text,
  difficulty text,
  ingredients jsonb,
  steps jsonb,
  allergens text[],
  tags text[],
  recipe_interests text[],
  created_at timestamptz,
  cheers_count integer,
  saves_count integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
    FROM public.cheers
    WHERE recipe_id IS NOT NULL
    GROUP BY recipe_id
  ) cheers_data ON r.id = cheers_data.recipe_id
  LEFT JOIN (
    SELECT recipe_id, COUNT(*) as count
    FROM public.saved_recipes
    GROUP BY recipe_id
  ) saves_data ON r.id = saves_data.recipe_id
  WHERE r.is_public = true
  ORDER BY r.created_at DESC;
$$;

-- Función para obtener una receta específica con toda su información
CREATE OR REPLACE FUNCTION get_recipe_by_id(recipe_uuid uuid)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  image_url text,
  youtube_url text,
  author_id uuid,
  author_name text,
  author_username text,
  author_avatar_url text,
  prep_time integer,
  cook_time integer,
  total_time integer,
  servings integer,
  cuisine_type text,
  difficulty text,
  ingredients jsonb,
  steps jsonb,
  allergens text[],
  tags text[],
  recipe_interests text[],
  created_at timestamptz,
  cheers_count integer,
  saves_count integer,
  comments_count integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
    FROM public.cheers
    WHERE recipe_id IS NOT NULL
    GROUP BY recipe_id
  ) cheers_data ON r.id = cheers_data.recipe_id
  LEFT JOIN (
    SELECT recipe_id, COUNT(*) as count
    FROM public.saved_recipes
    GROUP BY recipe_id
  ) saves_data ON r.id = saves_data.recipe_id
  LEFT JOIN (
    SELECT recipe_id, COUNT(*) as count
    FROM public.comments
    WHERE recipe_id IS NOT NULL
    GROUP BY recipe_id
  ) comments_data ON r.id = comments_data.recipe_id
  WHERE r.id = recipe_uuid AND r.is_public = true;
$$;
