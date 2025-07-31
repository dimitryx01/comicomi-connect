-- Actualizar la función can_send_message para verificar bloqueos bidireccionales
CREATE OR REPLACE FUNCTION public.can_send_message(sender_uuid uuid, receiver_uuid uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT NOT EXISTS (
    -- Verificar si hay bloqueo en cualquier dirección
    SELECT 1 FROM user_blocks 
    WHERE (blocker_id = receiver_uuid AND blocked_id = sender_uuid)
       OR (blocker_id = sender_uuid AND blocked_id = receiver_uuid)
  ) AND (
    -- Verificar si el receptor permite mensajes
    SELECT COALESCE(
      (SELECT allow_messages FROM user_message_preferences WHERE user_id = receiver_uuid),
      true -- Por defecto permite mensajes si no tiene preferencias configuradas
    )
  );
$function$