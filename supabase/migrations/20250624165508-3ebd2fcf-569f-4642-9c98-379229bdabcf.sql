
-- Optimizar políticas RLS para mejor rendimiento
-- Reemplazar auth.uid() con (SELECT auth.uid()) para evitar re-evaluación por fila

-- Políticas para tabla users
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

CREATE POLICY "Users can view their own profile" 
  ON public.users 
  FOR SELECT 
  USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update their own profile" 
  ON public.users 
  FOR UPDATE 
  USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.users 
  FOR INSERT 
  WITH CHECK ((SELECT auth.uid()) = id);

-- Políticas para tabla posts
DROP POLICY IF EXISTS "Authors can manage their posts" ON public.posts;
DROP POLICY IF EXISTS "Users can manage own posts" ON public.posts;

CREATE POLICY "Authors can manage their posts" 
  ON public.posts 
  FOR ALL 
  USING ((SELECT auth.uid()) = author_id);

-- Políticas para tabla recipes
DROP POLICY IF EXISTS "Authors can manage their recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can manage own recipes" ON public.recipes;

CREATE POLICY "Authors can manage their recipes" 
  ON public.recipes 
  FOR ALL 
  USING ((SELECT auth.uid()) = author_id);

-- Políticas para tabla cheers
DROP POLICY IF EXISTS "Users can manage their own cheers" ON public.cheers;
DROP POLICY IF EXISTS "Authenticated users can manage their cheers" ON public.cheers;

CREATE POLICY "Users can manage their own cheers" 
  ON public.cheers 
  FOR ALL 
  USING ((SELECT auth.uid()) = user_id);

-- Políticas para tabla comments
DROP POLICY IF EXISTS "Users can manage their own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;

CREATE POLICY "Users can create comments" 
  ON public.comments 
  FOR INSERT 
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own comments" 
  ON public.comments 
  FOR UPDATE 
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own comments" 
  ON public.comments 
  FOR DELETE 
  USING ((SELECT auth.uid()) = user_id);

-- Políticas para tabla user_interests
DROP POLICY IF EXISTS "Users can manage their own interests" ON public.user_interests;
DROP POLICY IF EXISTS "Users can view own interests" ON public.user_interests;
DROP POLICY IF EXISTS "Users can insert own interests" ON public.user_interests;
DROP POLICY IF EXISTS "Users can delete own interests" ON public.user_interests;

CREATE POLICY "Users can view own interests" 
  ON public.user_interests 
  FOR SELECT 
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own interests" 
  ON public.user_interests 
  FOR INSERT 
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own interests" 
  ON public.user_interests 
  FOR DELETE 
  USING ((SELECT auth.uid()) = user_id);

-- Políticas para tabla saved_posts
DROP POLICY IF EXISTS "Users can manage their saved posts" ON public.saved_posts;
DROP POLICY IF EXISTS "Users can manage their own saved posts" ON public.saved_posts;

CREATE POLICY "Users can manage their saved posts" 
  ON public.saved_posts 
  FOR ALL 
  USING ((SELECT auth.uid()) = user_id);

-- Políticas para otras tablas relacionadas que también podrían beneficiarse
DROP POLICY IF EXISTS "Users can manage their saved recipes" ON public.saved_recipes;
CREATE POLICY "Users can manage their saved recipes" 
  ON public.saved_recipes 
  FOR ALL 
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can manage their saved restaurants" ON public.saved_restaurants;
CREATE POLICY "Users can manage their saved restaurants" 
  ON public.saved_restaurants 
  FOR ALL 
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Authenticated users can manage their comment cheers" ON public.comment_cheers;
CREATE POLICY "Users can manage their comment cheers" 
  ON public.comment_cheers 
  FOR ALL 
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can create their own shared posts" ON public.shared_posts;
DROP POLICY IF EXISTS "Users can update their own shared posts" ON public.shared_posts;
DROP POLICY IF EXISTS "Users can delete their own shared posts" ON public.shared_posts;

CREATE POLICY "Users can create their own shared posts" 
  ON public.shared_posts 
  FOR INSERT 
  WITH CHECK ((SELECT auth.uid()) = sharer_id);

CREATE POLICY "Users can update their own shared posts" 
  ON public.shared_posts 
  FOR UPDATE 
  USING ((SELECT auth.uid()) = sharer_id);

CREATE POLICY "Users can delete their own shared posts" 
  ON public.shared_posts 
  FOR DELETE 
  USING ((SELECT auth.uid()) = sharer_id);

DROP POLICY IF EXISTS "Users can create their own shared post cheers" ON public.shared_post_cheers;
DROP POLICY IF EXISTS "Users can delete their own shared post cheers" ON public.shared_post_cheers;

CREATE POLICY "Users can create their own shared post cheers" 
  ON public.shared_post_cheers 
  FOR INSERT 
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own shared post cheers" 
  ON public.shared_post_cheers 
  FOR DELETE 
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can create their own shared post comments" ON public.shared_post_comments;
DROP POLICY IF EXISTS "Users can update their own shared post comments" ON public.shared_post_comments;
DROP POLICY IF EXISTS "Users can delete their own shared post comments" ON public.shared_post_comments;

CREATE POLICY "Users can create their own shared post comments" 
  ON public.shared_post_comments 
  FOR INSERT 
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own shared post comments" 
  ON public.shared_post_comments 
  FOR UPDATE 
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own shared post comments" 
  ON public.shared_post_comments 
  FOR DELETE 
  USING ((SELECT auth.uid()) = user_id);
