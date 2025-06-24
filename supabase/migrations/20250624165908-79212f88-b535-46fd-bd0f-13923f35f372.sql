
-- Optimización final de políticas RLS - solo las que necesitan corrección

-- 1. Eliminar políticas duplicadas en notifications (aún usan auth.uid() directo)
DROP POLICY IF EXISTS "Users can view their notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their notifications" ON public.notifications;

CREATE POLICY "Users can view their notifications" 
  ON public.notifications 
  FOR SELECT 
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING ((SELECT auth.uid()) = user_id);

-- 2. Consolidar políticas duplicadas en posts (mantener solo las optimizadas)
DROP POLICY IF EXISTS "Public posts are viewable" ON public.posts;
DROP POLICY IF EXISTS "Public posts are visible to everyone" ON public.posts;

-- Solo mantener "Authors can manage their posts" que ya está optimizada

-- 3. Consolidar políticas duplicadas en recipes
DROP POLICY IF EXISTS "Public recipes are viewable" ON public.recipes;
DROP POLICY IF EXISTS "Public recipes are visible to everyone" ON public.recipes;

-- Solo mantener "Authors can manage their recipes" que ya está optimizada

-- 4. Resolver múltiples políticas permisivas en cheers
DROP POLICY IF EXISTS "Users can view all cheers" ON public.cheers;

-- Mantener solo "Users can manage their own cheers" que ya cubre todo

-- 5. Resolver múltiples políticas permisivas en comment_cheers
DROP POLICY IF EXISTS "Users can view all comment cheers" ON public.comment_cheers;

-- Mantener solo "Users can manage their comment cheers" que ya cubre todo

-- 6. Resolver múltiples políticas permisivas en comments
DROP POLICY IF EXISTS "Public comments are viewable" ON public.comments;
DROP POLICY IF EXISTS "Users can view all public comments" ON public.comments;

-- Crear una sola política pública consolidada
CREATE POLICY "Everyone can view comments" 
  ON public.comments 
  FOR SELECT 
  USING (true);

-- 7. Resolver múltiples políticas permisivas en interest_categories
DROP POLICY IF EXISTS "Anyone can view interest categories" ON public.interest_categories;

-- Mantener solo "Interest categories are public"

-- 8. Resolver múltiples políticas permisivas en interests
DROP POLICY IF EXISTS "Anyone can view interests" ON public.interests;

-- Mantener solo "Interests are public"

-- 9. Resolver políticas duplicadas en users (nombres diferentes)
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- Las políticas optimizadas ya existen, no las recreamos
