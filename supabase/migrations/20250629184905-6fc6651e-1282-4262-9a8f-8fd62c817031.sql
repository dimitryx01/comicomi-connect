
-- Verificar y crear políticas RLS para la tabla notifications si no existen
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios puedan ver sus propias notificaciones
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para que los usuarios puedan actualizar sus propias notificaciones (marcar como leídas)
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Agregar triggers para crear notificaciones automáticamente
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
