
-- Crear tabla para cheers de publicaciones compartidas
CREATE TABLE public.shared_post_cheers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shared_post_id UUID NOT NULL REFERENCES public.shared_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(shared_post_id, user_id)
);

-- Crear tabla para comentarios de publicaciones compartidas
CREATE TABLE public.shared_post_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shared_post_id UUID NOT NULL REFERENCES public.shared_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES public.shared_post_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en ambas tablas
ALTER TABLE public.shared_post_cheers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_post_comments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para shared_post_cheers
CREATE POLICY "Users can view all shared post cheers" 
  ON public.shared_post_cheers 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create their own shared post cheers" 
  ON public.shared_post_cheers 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shared post cheers" 
  ON public.shared_post_cheers 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas RLS para shared_post_comments
CREATE POLICY "Users can view all shared post comments" 
  ON public.shared_post_comments 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create their own shared post comments" 
  ON public.shared_post_comments 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shared post comments" 
  ON public.shared_post_comments 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shared post comments" 
  ON public.shared_post_comments 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Crear funciones para obtener comentarios de publicaciones compartidas
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

-- Crear función para contar comentarios de publicaciones compartidas
CREATE OR REPLACE FUNCTION public.get_shared_post_comments_count(shared_post_uuid uuid)
RETURNS integer
LANGUAGE sql
STABLE
AS $function$
  SELECT COUNT(*)::integer
  FROM public.shared_post_comments
  WHERE shared_post_id = shared_post_uuid;
$function$;

-- Agregar trigger para actualizar updated_at en shared_post_comments
CREATE TRIGGER update_shared_post_comments_updated_at
  BEFORE UPDATE ON public.shared_post_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
