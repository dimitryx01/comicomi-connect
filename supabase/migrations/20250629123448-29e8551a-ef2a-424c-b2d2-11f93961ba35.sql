
-- Crear tabla para mensajes privados
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_read BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para preferencias de mensajería de usuarios
CREATE TABLE public.user_message_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  allow_messages BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Crear tabla para bloqueos entre usuarios
CREATE TABLE public.user_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

-- Crear tabla para reportes de mensajes
CREATE TABLE public.message_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_message_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reports ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para messages
CREATE POLICY "Users can view their own messages" 
  ON public.messages 
  FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" 
  ON public.messages 
  FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received messages" 
  ON public.messages 
  FOR UPDATE 
  USING (auth.uid() = receiver_id);

-- Políticas RLS para user_message_preferences
CREATE POLICY "Users can view their own message preferences" 
  ON public.user_message_preferences 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own message preferences" 
  ON public.user_message_preferences 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own message preferences" 
  ON public.user_message_preferences 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Políticas RLS para user_blocks
CREATE POLICY "Users can view their own blocks" 
  ON public.user_blocks 
  FOR SELECT 
  USING (auth.uid() = blocker_id);

CREATE POLICY "Users can create their own blocks" 
  ON public.user_blocks 
  FOR INSERT 
  WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can delete their own blocks" 
  ON public.user_blocks 
  FOR DELETE 
  USING (auth.uid() = blocker_id);

-- Políticas RLS para message_reports
CREATE POLICY "Users can view their own reports" 
  ON public.message_reports 
  FOR SELECT 
  USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create message reports" 
  ON public.message_reports 
  FOR INSERT 
  WITH CHECK (auth.uid() = reporter_id);

-- Crear índices para mejorar rendimiento
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_messages_conversation ON public.messages(sender_id, receiver_id, created_at DESC);
CREATE INDEX idx_user_blocks_blocker_id ON public.user_blocks(blocker_id);
CREATE INDEX idx_user_blocks_blocked_id ON public.user_blocks(blocked_id);

-- Trigger para actualizar updated_at en messages
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para actualizar updated_at en user_message_preferences
CREATE TRIGGER update_user_message_preferences_updated_at
  BEFORE UPDATE ON public.user_message_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Función para obtener conversaciones del usuario
CREATE OR REPLACE FUNCTION public.get_user_conversations(user_uuid uuid)
RETURNS TABLE(
  conversation_partner_id uuid,
  conversation_partner_name text,
  conversation_partner_username text,
  conversation_partner_avatar text,
  last_message_text text,
  last_message_time timestamp with time zone,
  unread_count integer,
  is_sender boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  WITH conversation_messages AS (
    SELECT 
      CASE 
        WHEN sender_id = user_uuid THEN receiver_id
        ELSE sender_id
      END as partner_id,
      text,
      created_at,
      sender_id = user_uuid as is_sender,
      NOT is_read AND receiver_id = user_uuid as is_unread,
      ROW_NUMBER() OVER (
        PARTITION BY 
          CASE 
            WHEN sender_id = user_uuid THEN receiver_id
            ELSE sender_id
          END
        ORDER BY created_at DESC
      ) as rn
    FROM messages
    WHERE sender_id = user_uuid OR receiver_id = user_uuid
  ),
  latest_messages AS (
    SELECT 
      partner_id,
      text as last_message_text,
      created_at as last_message_time,
      is_sender
    FROM conversation_messages
    WHERE rn = 1
  ),
  unread_counts AS (
    SELECT 
      CASE 
        WHEN sender_id = user_uuid THEN receiver_id
        ELSE sender_id
      END as partner_id,
      COUNT(*) as unread_count
    FROM messages
    WHERE (sender_id = user_uuid OR receiver_id = user_uuid)
      AND NOT is_read 
      AND receiver_id = user_uuid
    GROUP BY partner_id
  )
  SELECT 
    lm.partner_id,
    u.full_name,
    u.username,
    u.avatar_url,
    lm.last_message_text,
    lm.last_message_time,
    COALESCE(uc.unread_count, 0)::integer,
    lm.is_sender
  FROM latest_messages lm
  LEFT JOIN users u ON lm.partner_id = u.id
  LEFT JOIN unread_counts uc ON lm.partner_id = uc.partner_id
  ORDER BY lm.last_message_time DESC;
$function$;

-- Función para obtener mensajes de una conversación
CREATE OR REPLACE FUNCTION public.get_conversation_messages(
  user_uuid uuid,
  partner_uuid uuid,
  page_limit integer DEFAULT 50,
  page_offset integer DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  sender_id uuid,
  receiver_id uuid,
  text text,
  created_at timestamp with time zone,
  is_read boolean,
  sender_name text,
  sender_username text,
  sender_avatar text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT 
    m.id,
    m.sender_id,
    m.receiver_id,
    m.text,
    m.created_at,
    m.is_read,
    u.full_name as sender_name,
    u.username as sender_username,
    u.avatar_url as sender_avatar
  FROM messages m
  LEFT JOIN users u ON m.sender_id = u.id
  WHERE (
    (m.sender_id = user_uuid AND m.receiver_id = partner_uuid) OR
    (m.sender_id = partner_uuid AND m.receiver_id = user_uuid)
  )
  ORDER BY m.created_at DESC
  LIMIT page_limit
  OFFSET page_offset;
$function$;

-- Función para verificar si un usuario puede enviar mensajes a otro
CREATE OR REPLACE FUNCTION public.can_send_message(
  sender_uuid uuid,
  receiver_uuid uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT NOT EXISTS (
    -- Verificar si el receptor tiene bloqueado al emisor
    SELECT 1 FROM user_blocks 
    WHERE blocker_id = receiver_uuid AND blocked_id = sender_uuid
  ) AND (
    -- Verificar si el receptor permite mensajes
    SELECT COALESCE(
      (SELECT allow_messages FROM user_message_preferences WHERE user_id = receiver_uuid),
      true -- Por defecto permite mensajes si no tiene preferencias configuradas
    )
  );
$function$;

-- Habilitar realtime para las tablas de mensajes
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_message_preferences;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_blocks;
