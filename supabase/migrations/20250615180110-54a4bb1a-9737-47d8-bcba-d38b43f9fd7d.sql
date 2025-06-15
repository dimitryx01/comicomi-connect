
-- Solución corregida para las alertas de seguridad de Supabase

-- 1. Eliminar triggers dependientes antes de recrear las funciones
DROP TRIGGER IF EXISTS calculate_overall_rating_trigger ON public.restaurant_reviews;
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_restaurants_updated_at ON public.restaurants;
DROP TRIGGER IF EXISTS update_recipes_updated_at ON public.recipes;
DROP TRIGGER IF EXISTS update_posts_updated_at ON public.posts;
DROP TRIGGER IF EXISTS sync_user_names_trigger ON public.users;

-- 2. Ahora eliminar y recrear las funciones con mayor seguridad
DROP FUNCTION IF EXISTS public.calculate_restaurant_overall_rating() CASCADE;

CREATE OR REPLACE FUNCTION public.calculate_restaurant_overall_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.overall_rating = (
    (NEW.food_quality_rating * 0.3) +
    (NEW.service_rating * 0.25) +
    (NEW.cleanliness_rating * 0.15) +
    (NEW.ambiance_rating * 0.15) +
    (NEW.value_rating * 0.15)
  );
  RETURN NEW;
END;
$function$;

DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

DROP FUNCTION IF EXISTS public.sync_user_names() CASCADE;

CREATE OR REPLACE FUNCTION public.sync_user_names()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    -- Sincronizar full_name cuando se actualiza first_name o last_name
    IF NEW.first_name IS NOT NULL OR NEW.last_name IS NOT NULL THEN
        NEW.full_name = TRIM(COALESCE(NEW.first_name, '') || ' ' || COALESCE(NEW.last_name, ''));
    END IF;
    
    -- Sincronizar location cuando se actualiza city o country
    IF NEW.city IS NOT NULL OR NEW.country IS NOT NULL THEN
        NEW.location = CASE 
            WHEN NEW.city IS NOT NULL AND NEW.country IS NOT NULL THEN NEW.city || ', ' || NEW.country
            WHEN NEW.city IS NOT NULL THEN NEW.city
            WHEN NEW.country IS NOT NULL THEN NEW.country
            ELSE NULL
        END;
    END IF;
    
    RETURN NEW;
END;
$function$;

-- 3. Recrear los triggers con las funciones actualizadas
CREATE TRIGGER calculate_overall_rating_trigger
    BEFORE INSERT OR UPDATE ON public.restaurant_reviews
    FOR EACH ROW EXECUTE FUNCTION calculate_restaurant_overall_rating();

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurants_updated_at 
    BEFORE UPDATE ON public.restaurants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at 
    BEFORE UPDATE ON public.recipes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at 
    BEFORE UPDATE ON public.posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER sync_user_names_trigger
    BEFORE INSERT OR UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION sync_user_names();

-- 4. Verificar que todas las tablas tengan RLS habilitado
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cheers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_cheers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_cheers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interest_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;

-- 5. Crear políticas RLS básicas para las tablas principales
-- Solo crear si no existen ya
DO $$ 
BEGIN
    -- Usuarios pueden ver su propia información
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can view own profile') THEN
        CREATE POLICY "Users can view own profile" ON public.users
          FOR SELECT USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can update own profile') THEN
        CREATE POLICY "Users can update own profile" ON public.users
          FOR UPDATE USING (auth.uid() = id);
    END IF;

    -- Posts públicos visibles para todos
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'Public posts are visible to everyone') THEN
        CREATE POLICY "Public posts are visible to everyone" ON public.posts
          FOR SELECT USING (is_public = true OR auth.uid() = author_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'Users can manage own posts') THEN
        CREATE POLICY "Users can manage own posts" ON public.posts
          FOR ALL USING (auth.uid() = author_id);
    END IF;

    -- Recetas públicas visibles para todos
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recipes' AND policyname = 'Public recipes are visible to everyone') THEN
        CREATE POLICY "Public recipes are visible to everyone" ON public.recipes
          FOR SELECT USING (is_public = true OR auth.uid() = author_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recipes' AND policyname = 'Users can manage own recipes') THEN
        CREATE POLICY "Users can manage own recipes" ON public.recipes
          FOR ALL USING (auth.uid() = author_id);
    END IF;

    -- Restaurantes públicos visibles para todos
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'restaurants' AND policyname = 'Restaurants are visible to everyone') THEN
        CREATE POLICY "Restaurants are visible to everyone" ON public.restaurants
          FOR SELECT USING (true);
    END IF;

    -- Categorías e intereses públicos
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'interest_categories' AND policyname = 'Interest categories are public') THEN
        CREATE POLICY "Interest categories are public" ON public.interest_categories
          FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'interests' AND policyname = 'Interests are public') THEN
        CREATE POLICY "Interests are public" ON public.interests
          FOR SELECT USING (true);
    END IF;
END $$;
