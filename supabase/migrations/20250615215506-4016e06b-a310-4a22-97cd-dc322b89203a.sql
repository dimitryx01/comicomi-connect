
-- Habilitar RLS en la tabla de comentarios
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Políticas para comentarios
CREATE POLICY "Users can view all public comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON public.comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- Habilitar RLS en la tabla de cheers para comentarios
ALTER TABLE public.comment_cheers ENABLE ROW LEVEL SECURITY;

-- Políticas para cheers de comentarios
CREATE POLICY "Users can view all comment cheers" ON public.comment_cheers FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage their comment cheers" ON public.comment_cheers FOR ALL USING (auth.uid() = user_id);

-- Configurar realtime para comentarios
ALTER TABLE public.comments REPLICA IDENTITY FULL;
ALTER TABLE public.comment_cheers REPLICA IDENTITY FULL;

-- Agregar tablas a la publicación de realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comment_cheers;

-- Crear función para obtener el conteo de comentarios por post
CREATE OR REPLACE FUNCTION get_post_comments_count(post_uuid uuid)
RETURNS integer
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*)::integer
  FROM public.comments
  WHERE post_id = post_uuid;
$$;

-- Crear función para obtener comentarios de un post con información del usuario
CREATE OR REPLACE FUNCTION get_post_comments(post_uuid uuid)
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
$$;
