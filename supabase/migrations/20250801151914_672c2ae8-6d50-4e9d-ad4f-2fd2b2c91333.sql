-- Actualizar la función create_notification para soportar el nuevo tipo de notificación
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
    WHEN p_type = 'CONTENT_MODERATION_DELETE' THEN 'Contenido eliminado por moderación'
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