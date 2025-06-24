
-- Corrección de políticas RLS - eliminar existentes primero

-- 1. Limpiar todas las políticas existentes de posts
DROP POLICY IF EXISTS "Authors can manage their posts" ON public.posts;
DROP POLICY IF EXISTS "Users can view public posts" ON public.posts;
DROP POLICY IF EXISTS "Public posts are visible to everyone" ON public.posts;
DROP POLICY IF EXISTS "Everyone can view public posts" ON public.posts;
DROP POLICY IF EXISTS "Authors can manage their own posts" ON public.posts;

-- 2. Limpiar políticas de shared_posts
DROP POLICY IF EXISTS "Users can view all shared posts" ON public.shared_posts;
DROP POLICY IF EXISTS "Users can manage their shared posts" ON public.shared_posts;
DROP POLICY IF EXISTS "Everyone can view shared posts" ON public.shared_posts;
DROP POLICY IF EXISTS "Users can manage their own shared posts" ON public.shared_posts;

-- 3. Limpiar políticas de usuarios
DROP POLICY IF EXISTS "Everyone can view user profiles" ON public.users;
DROP POLICY IF EXISTS "Users can view public profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

-- 4. Limpiar políticas de cheers
DROP POLICY IF EXISTS "Users can manage their own cheers" ON public.cheers;
DROP POLICY IF EXISTS "Users can view all cheers" ON public.cheers;
DROP POLICY IF EXISTS "Everyone can view cheers" ON public.cheers;

-- 5. Limpiar políticas de comentarios
DROP POLICY IF EXISTS "Everyone can view comments" ON public.comments;
DROP POLICY IF EXISTS "Users can create comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;

-- 6. Limpiar políticas de restaurantes
DROP POLICY IF EXISTS "Everyone can view restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Restaurants are visible to everyone" ON public.restaurants;

-- 7. Limpiar políticas de recetas
DROP POLICY IF EXISTS "Everyone can view public recipes" ON public.recipes;
DROP POLICY IF EXISTS "Public recipes are visible to everyone" ON public.recipes;

-- Ahora crear las políticas correctas

-- POSTS - Políticas públicas
CREATE POLICY "Everyone can view public posts" 
  ON public.posts 
  FOR SELECT 
  USING (is_public = true);

CREATE POLICY "Authors can manage their own posts" 
  ON public.posts 
  FOR ALL 
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- SHARED POSTS - Visibles para todos
CREATE POLICY "Everyone can view shared posts" 
  ON public.shared_posts 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can manage their own shared posts" 
  ON public.shared_posts 
  FOR ALL 
  USING (auth.uid() = sharer_id)
  WITH CHECK (auth.uid() = sharer_id);

-- USUARIOS - Perfiles públicos
CREATE POLICY "Everyone can view user profiles" 
  ON public.users 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can update their own profile" 
  ON public.users 
  FOR UPDATE 
  USING (auth.uid() = id);

-- CHEERS - Visibles para todos, gestionables por propietario
CREATE POLICY "Everyone can view cheers" 
  ON public.cheers 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can manage their own cheers" 
  ON public.cheers 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- COMENTARIOS - Visibles para todos
CREATE POLICY "Everyone can view comments" 
  ON public.comments 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create comments" 
  ON public.comments 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
  ON public.comments 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
  ON public.comments 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RESTAURANTES - Públicos
CREATE POLICY "Everyone can view restaurants" 
  ON public.restaurants 
  FOR SELECT 
  USING (true);

-- RECETAS - Públicas si is_public = true
CREATE POLICY "Everyone can view public recipes" 
  ON public.recipes 
  FOR SELECT 
  USING (is_public = true);

-- Índices para optimización (solo si no existen)
CREATE INDEX IF NOT EXISTS idx_posts_public_created_at ON public.posts (is_public, created_at DESC) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_shared_posts_created_at ON public.shared_posts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts (author_id);
CREATE INDEX IF NOT EXISTS idx_shared_posts_sharer_id ON public.shared_posts (sharer_id);
