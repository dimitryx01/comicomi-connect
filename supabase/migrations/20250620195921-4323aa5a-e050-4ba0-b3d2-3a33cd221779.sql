
-- Crear tabla para manejar publicaciones compartidas
CREATE TABLE public.shared_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sharer_id UUID NOT NULL,
  shared_type TEXT NOT NULL CHECK (shared_type IN ('post', 'recipe', 'restaurant')),
  shared_post_id UUID NULL,
  shared_recipe_id UUID NULL,
  shared_restaurant_id UUID NULL,
  comment TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT shared_posts_one_reference CHECK (
    (shared_post_id IS NOT NULL AND shared_recipe_id IS NULL AND shared_restaurant_id IS NULL) OR
    (shared_post_id IS NULL AND shared_recipe_id IS NOT NULL AND shared_restaurant_id IS NULL) OR
    (shared_post_id IS NULL AND shared_recipe_id IS NULL AND shared_restaurant_id IS NOT NULL)
  )
);

-- Habilitar RLS para shared_posts
ALTER TABLE public.shared_posts ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para shared_posts
CREATE POLICY "Users can view all shared posts" 
  ON public.shared_posts 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own shared posts" 
  ON public.shared_posts 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = sharer_id);

CREATE POLICY "Users can update their own shared posts" 
  ON public.shared_posts 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = sharer_id);

CREATE POLICY "Users can delete their own shared posts" 
  ON public.shared_posts 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = sharer_id);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_shared_posts_updated_at
  BEFORE UPDATE ON public.shared_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar realtime para shared_posts
ALTER PUBLICATION supabase_realtime ADD TABLE public.shared_posts;
