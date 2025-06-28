
-- Crear tabla para guardar publicaciones compartidas
CREATE TABLE IF NOT EXISTS public.saved_shared_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  shared_post_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, shared_post_id)
);

-- Habilitar RLS para saved_shared_posts
ALTER TABLE public.saved_shared_posts ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para saved_shared_posts
CREATE POLICY "Users can view their own saved shared posts" 
  ON public.saved_shared_posts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save shared posts" 
  ON public.saved_shared_posts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave their shared posts" 
  ON public.saved_shared_posts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_saved_posts_user_id ON public.saved_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_recipes_user_id ON public.saved_recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_restaurants_user_id ON public.saved_restaurants(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_shared_posts_user_id ON public.saved_shared_posts(user_id);
