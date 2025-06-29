
-- Corregir la función create_notification para incluir el campo title requerido
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid, 
  p_actor_id uuid, 
  p_type text, 
  p_related_entity_type text DEFAULT NULL::text, 
  p_related_entity_id uuid DEFAULT NULL::uuid, 
  p_message text DEFAULT ''::text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  notification_id UUID;
  notification_title TEXT;
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
  
  -- Generar título basado en el tipo
  notification_title := CASE 
    WHEN p_type = 'NEW_FOLLOWER' THEN 'Nuevo seguidor'
    WHEN p_type = 'NEW_COMMENT' THEN 'Nuevo comentario'
    WHEN p_type = 'NEW_RECIPE_COMMENT' THEN 'Comentario en receta'
    WHEN p_type = 'POST_CHEER' THEN 'Le gustó tu post'
    WHEN p_type = 'RECIPE_CHEER' THEN 'Le gustó tu receta'
    WHEN p_type = 'NEW_MESSAGE' THEN 'Nuevo mensaje'
    ELSE 'Notificación'
  END;
  
  -- Crear la notificación
  INSERT INTO public.notifications (
    user_id, 
    actor_id, 
    type, 
    related_entity_type, 
    related_entity_id, 
    title,
    message
  )
  VALUES (
    p_user_id, 
    p_actor_id, 
    p_type, 
    p_related_entity_type, 
    p_related_entity_id, 
    notification_title,
    p_message
  )
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$function$;

-- Actualizar función notify_new_follower para manejar errores
CREATE OR REPLACE FUNCTION public.notify_new_follower()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  actor_name TEXT;
BEGIN
  -- Solo para seguimientos de usuarios (no restaurantes)
  IF NEW.followed_user_id IS NOT NULL THEN
    BEGIN
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
    EXCEPTION
      WHEN others THEN
        -- Log el error pero no fallar la operación principal
        RAISE WARNING 'Error creating follower notification: %', SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Actualizar función notify_new_comment para manejar errores
CREATE OR REPLACE FUNCTION public.notify_new_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  post_author_id UUID;
  actor_name TEXT;
BEGIN
  -- Solo para comentarios en posts (no recetas)
  IF NEW.post_id IS NOT NULL THEN
    BEGIN
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
    EXCEPTION
      WHEN others THEN
        -- Log el error pero no fallar la operación principal
        RAISE WARNING 'Error creating comment notification: %', SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Actualizar función notify_new_recipe_comment para manejar errores
CREATE OR REPLACE FUNCTION public.notify_new_recipe_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  recipe_author_id UUID;
  actor_name TEXT;
BEGIN
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
  EXCEPTION
    WHEN others THEN
      -- Log el error pero no fallar la operación principal
      RAISE WARNING 'Error creating recipe comment notification: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$function$;

-- Actualizar función notify_post_cheer para manejar errores
CREATE OR REPLACE FUNCTION public.notify_post_cheer()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  post_author_id UUID;
  actor_name TEXT;
BEGIN
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
  EXCEPTION
    WHEN others THEN
      -- Log el error pero no fallar la operación principal  
      RAISE WARNING 'Error creating post cheer notification: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$function$;

-- Actualizar función notify_recipe_cheer para manejar errores
CREATE OR REPLACE FUNCTION public.notify_recipe_cheer()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  recipe_author_id UUID;
  actor_name TEXT;
BEGIN
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
  EXCEPTION
    WHEN others THEN
      -- Log el error pero no fallar la operación principal
      RAISE WARNING 'Error creating recipe cheer notification: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$function$;

-- Actualizar función notify_new_message para manejar errores
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  sender_name TEXT;
BEGIN
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
  EXCEPTION
    WHEN others THEN
      -- Log el error pero no fallar la operación principal
      RAISE WARNING 'Error creating message notification: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$function$;

-- Asegurar que los triggers existen pero con manejo de errores
DROP TRIGGER IF EXISTS trigger_notify_new_follower ON public.user_follows;
CREATE TRIGGER trigger_notify_new_follower
    AFTER INSERT ON public.user_follows
    FOR EACH ROW EXECUTE FUNCTION notify_new_follower();

DROP TRIGGER IF EXISTS trigger_notify_new_comment ON public.comments;
CREATE TRIGGER trigger_notify_new_comment
    AFTER INSERT ON public.comments
    FOR EACH ROW EXECUTE FUNCTION notify_new_comment();

DROP TRIGGER IF EXISTS trigger_notify_new_recipe_comment ON public.recipe_comments;
CREATE TRIGGER trigger_notify_new_recipe_comment
    AFTER INSERT ON public.recipe_comments
    FOR EACH ROW EXECUTE FUNCTION notify_new_recipe_comment();

DROP TRIGGER IF EXISTS trigger_notify_post_cheer ON public.cheers;
CREATE TRIGGER trigger_notify_post_cheer
    AFTER INSERT ON public.cheers
    FOR EACH ROW EXECUTE FUNCTION notify_post_cheer();

DROP TRIGGER IF EXISTS trigger_notify_recipe_cheer ON public.recipe_cheers;
CREATE TRIGGER trigger_notify_recipe_cheer
    AFTER INSERT ON public.recipe_cheers
    FOR EACH ROW EXECUTE FUNCTION notify_recipe_cheer();

DROP TRIGGER IF EXISTS trigger_notify_new_message ON public.messages;
CREATE TRIGGER trigger_notify_new_message
    AFTER INSERT ON public.messages
    FOR EACH ROW EXECUTE FUNCTION notify_new_message();
