
-- Primero, agregar las columnas faltantes a la tabla notifications
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS type TEXT;

ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS related_entity_type TEXT;

ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS related_entity_id UUID;

ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS message TEXT;

ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;

ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Crear índices para mejorar el rendimiento (solo si no existen)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_user_id') THEN
    CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_created_at') THEN
    CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_is_read') THEN
    CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_type') THEN
    CREATE INDEX idx_notifications_type ON public.notifications(type);
  END IF;
END $$;

-- Habilitar RLS (solo si no está habilitado)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'notifications' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Crear políticas RLS (con IF NOT EXISTS implícito mediante DO)
DO $$
BEGIN
  -- Política para que los usuarios solo vean sus propias notificaciones
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'notifications' 
    AND policyname = 'Users can view their own notifications'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view their own notifications" 
      ON public.notifications 
      FOR SELECT 
      USING (auth.uid() = user_id)';
  END IF;

  -- Política para insertar notificaciones
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'notifications' 
    AND policyname = 'Authenticated users can create notifications'
  ) THEN
    EXECUTE 'CREATE POLICY "Authenticated users can create notifications" 
      ON public.notifications 
      FOR INSERT 
      WITH CHECK (auth.uid() IS NOT NULL)';
  END IF;

  -- Política para actualizar notificaciones
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'notifications' 
    AND policyname = 'Users can update their own notifications'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can update their own notifications" 
      ON public.notifications 
      FOR UPDATE 
      USING (auth.uid() = user_id)';
  END IF;

  -- Política para eliminar notificaciones
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'notifications' 
    AND policyname = 'Users can delete their own notifications'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can delete their own notifications" 
      ON public.notifications 
      FOR DELETE 
      USING (auth.uid() = user_id)';
  END IF;
END $$;

-- Función para crear notificación evitando duplicados y auto-notificaciones
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_actor_id UUID,
  p_type TEXT,
  p_related_entity_type TEXT DEFAULT NULL,
  p_related_entity_id UUID DEFAULT NULL,
  p_message TEXT DEFAULT ''
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  notification_id UUID;
BEGIN
  -- No crear notificación si el actor es el mismo que el receptor
  IF p_actor_id = p_user_id THEN
    RETURN NULL;
  END IF;
  
  -- Evitar duplicados recientes (últimos 5 minutos)
  IF EXISTS (
    SELECT 1 FROM public.notifications 
    WHERE user_id = p_user_id 
      AND actor_id = p_actor_id 
      AND type = p_type 
      AND related_entity_type = p_related_entity_type 
      AND related_entity_id = p_related_entity_id
      AND created_at > now() - interval '5 minutes'
  ) THEN
    RETURN NULL;
  END IF;
  
  -- Crear la notificación
  INSERT INTO public.notifications (
    user_id, 
    actor_id, 
    type, 
    related_entity_type, 
    related_entity_id, 
    message
  )
  VALUES (
    p_user_id, 
    p_actor_id, 
    p_type, 
    p_related_entity_type, 
    p_related_entity_id, 
    p_message
  )
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Función para obtener notificaciones con información del actor
CREATE OR REPLACE FUNCTION public.get_user_notifications(
  target_user_id UUID,
  page_limit INTEGER DEFAULT 20,
  page_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  type TEXT,
  related_entity_type TEXT,
  related_entity_id UUID,
  message TEXT,
  is_read BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  actor_id UUID,
  actor_name TEXT,
  actor_username TEXT,
  actor_avatar TEXT
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    n.id,
    n.type,
    n.related_entity_type,
    n.related_entity_id,
    n.message,
    n.is_read,
    n.created_at,
    n.actor_id,
    u.full_name as actor_name,
    u.username as actor_username,
    u.avatar_url as actor_avatar
  FROM public.notifications n
  LEFT JOIN public.users u ON n.actor_id = u.id
  WHERE n.user_id = target_user_id
  ORDER BY n.created_at DESC
  LIMIT page_limit
  OFFSET page_offset;
$$;

-- Función para contar notificaciones no leídas
CREATE OR REPLACE FUNCTION public.get_unread_notifications_count(target_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.notifications
  WHERE user_id = target_user_id AND is_read = false;
$$;

-- Triggers para generar notificaciones automáticamente

-- Trigger para nuevos seguidores
CREATE OR REPLACE FUNCTION public.notify_new_follower()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  actor_name TEXT;
BEGIN
  -- Solo para seguimientos de usuarios (no restaurantes)
  IF NEW.followed_user_id IS NOT NULL THEN
    -- Obtener nombre del seguidor
    SELECT full_name INTO actor_name 
    FROM public.users 
    WHERE id = NEW.follower_id;
    
    -- Crear notificación
    PERFORM public.create_notification(
      NEW.followed_user_id,
      NEW.follower_id,
      'NEW_FOLLOWER',
      'user',
      NEW.follower_id,
      COALESCE(actor_name, 'Alguien') || ' comenzó a seguirte'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Crear trigger solo si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trigger_notify_new_follower'
  ) THEN
    CREATE TRIGGER trigger_notify_new_follower
      AFTER INSERT ON public.user_follows
      FOR EACH ROW
      EXECUTE FUNCTION public.notify_new_follower();
  END IF;
END $$;

-- Trigger para nuevos comentarios en posts
CREATE OR REPLACE FUNCTION public.notify_new_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  post_author_id UUID;
  actor_name TEXT;
BEGIN
  -- Solo para comentarios en posts (no recetas)
  IF NEW.post_id IS NOT NULL THEN
    -- Obtener autor del post
    SELECT author_id INTO post_author_id 
    FROM public.posts 
    WHERE id = NEW.post_id;
    
    -- Obtener nombre del comentarista
    SELECT full_name INTO actor_name 
    FROM public.users 
    WHERE id = NEW.user_id;
    
    -- Crear notificación para el autor del post
    IF post_author_id IS NOT NULL THEN
      PERFORM public.create_notification(
        post_author_id,
        NEW.user_id,
        'NEW_COMMENT',
        'post',
        NEW.post_id,
        COALESCE(actor_name, 'Alguien') || ' comentó en tu publicación'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trigger_notify_new_comment'
  ) THEN
    CREATE TRIGGER trigger_notify_new_comment
      AFTER INSERT ON public.comments
      FOR EACH ROW
      EXECUTE FUNCTION public.notify_new_comment();
  END IF;
END $$;

-- Trigger para nuevos comentarios en recetas
CREATE OR REPLACE FUNCTION public.notify_new_recipe_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  recipe_author_id UUID;
  actor_name TEXT;
BEGIN
  -- Obtener autor de la receta
  SELECT author_id INTO recipe_author_id 
  FROM public.recipes 
  WHERE id = NEW.recipe_id;
  
  -- Obtener nombre del comentarista
  SELECT full_name INTO actor_name 
  FROM public.users 
  WHERE id = NEW.user_id;
  
  -- Crear notificación para el autor de la receta
  IF recipe_author_id IS NOT NULL THEN
    PERFORM public.create_notification(
      recipe_author_id,
      NEW.user_id,
      'NEW_RECIPE_COMMENT',
      'recipe',
      NEW.recipe_id,
      COALESCE(actor_name, 'Alguien') || ' comentó en tu receta'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trigger_notify_new_recipe_comment'
  ) THEN
    CREATE TRIGGER trigger_notify_new_recipe_comment
      AFTER INSERT ON public.recipe_comments
      FOR EACH ROW
      EXECUTE FUNCTION public.notify_new_recipe_comment();
  END IF;
END $$;

-- Trigger para cheers en posts
CREATE OR REPLACE FUNCTION public.notify_post_cheer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  post_author_id UUID;
  actor_name TEXT;
BEGIN
  -- Obtener autor del post
  SELECT author_id INTO post_author_id 
  FROM public.posts 
  WHERE id = NEW.post_id;
  
  -- Obtener nombre del usuario que dio cheer
  SELECT full_name INTO actor_name 
  FROM public.users 
  WHERE id = NEW.user_id;
  
  -- Crear notificación para el autor del post
  IF post_author_id IS NOT NULL THEN
    PERFORM public.create_notification(
      post_author_id,
      NEW.user_id,
      'POST_CHEER',
      'post',
      NEW.post_id,
      COALESCE(actor_name, 'Alguien') || ' le dio cheer a tu publicación'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trigger_notify_post_cheer'
  ) THEN
    CREATE TRIGGER trigger_notify_post_cheer
      AFTER INSERT ON public.cheers
      FOR EACH ROW
      EXECUTE FUNCTION public.notify_post_cheer();
  END IF;
END $$;

-- Trigger para cheers en recetas
CREATE OR REPLACE FUNCTION public.notify_recipe_cheer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  recipe_author_id UUID;
  actor_name TEXT;
BEGIN
  -- Obtener autor de la receta
  SELECT author_id INTO recipe_author_id 
  FROM public.recipes 
  WHERE id = NEW.recipe_id;
  
  -- Obtener nombre del usuario que dio cheer
  SELECT full_name INTO actor_name 
  FROM public.users 
  WHERE id = NEW.user_id;
  
  -- Crear notificación para el autor de la receta
  IF recipe_author_id IS NOT NULL THEN
    PERFORM public.create_notification(
      recipe_author_id,
      NEW.user_id,
      'RECIPE_CHEER',
      'recipe',
      NEW.recipe_id,
      COALESCE(actor_name, 'Alguien') || ' le dio cheer a tu receta'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trigger_notify_recipe_cheer'
  ) THEN
    CREATE TRIGGER trigger_notify_recipe_cheer
      AFTER INSERT ON public.recipe_cheers
      FOR EACH ROW
      EXECUTE FUNCTION public.notify_recipe_cheer();
  END IF;
END $$;

-- Trigger para nuevos mensajes
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  sender_name TEXT;
BEGIN
  -- Obtener nombre del remitente
  SELECT full_name INTO sender_name 
  FROM public.users 
  WHERE id = NEW.sender_id;
  
  -- Crear notificación para el receptor
  PERFORM public.create_notification(
    NEW.receiver_id,
    NEW.sender_id,
    'NEW_MESSAGE',
    'message',
    NEW.id,
    COALESCE(sender_name, 'Alguien') || ' te envió un mensaje'
  );
  
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trigger_notify_new_message'
  ) THEN
    CREATE TRIGGER trigger_notify_new_message
      AFTER INSERT ON public.messages
      FOR EACH ROW
      EXECUTE FUNCTION public.notify_new_message();
  END IF;
END $$;

-- Habilitar realtime para la tabla de notificaciones
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
