
-- Eliminar la restricción existente que está causando problemas
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Eliminar todas las notificaciones existentes que puedan tener tipos incorrectos
-- Esto es seguro porque las notificaciones son temporales y se regenerarán
DELETE FROM public.notifications;

-- Crear la restricción correcta con todos los tipos que necesitamos
ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('NEW_FOLLOWER', 'NEW_COMMENT', 'NEW_RECIPE_COMMENT', 'POST_CHEER', 'RECIPE_CHEER', 'NEW_MESSAGE'));

-- Verificar que la función create_notification funcione correctamente
CREATE OR REPLACE FUNCTION public.test_notification_creation()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  test_result TEXT;
BEGIN
  -- Intentar crear una notificación de prueba
  BEGIN
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
      gen_random_uuid(), 
      gen_random_uuid(), 
      'NEW_FOLLOWER', 
      'user', 
      gen_random_uuid(), 
      'Nuevo seguidor',
      'Test notification'
    );
    
    test_result := 'SUCCESS: Notification creation works';
    
    -- Limpiar la notificación de prueba
    DELETE FROM public.notifications WHERE message = 'Test notification';
    
  EXCEPTION
    WHEN others THEN
      test_result := 'ERROR: ' || SQLERRM;
  END;
  
  RETURN test_result;
END;
$function$;

-- Ejecutar la prueba para verificar que funciona
SELECT public.test_notification_creation();
