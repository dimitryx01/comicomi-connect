-- Crear función para validar admin users
CREATE OR REPLACE FUNCTION is_valid_admin_user(admin_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = admin_id AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar políticas RLS existentes para moderation_actions
DROP POLICY IF EXISTS "Admin users can create moderation actions" ON moderation_actions;
DROP POLICY IF EXISTS "Admin users can view moderation actions" ON moderation_actions;

-- Crear nuevas políticas RLS que funcionen con el sistema de admin personalizado
CREATE POLICY "Admin users can create moderation actions" 
ON moderation_actions 
FOR INSERT 
WITH CHECK (
  is_valid_admin_user(admin_user_id) AND
  EXISTS (
    SELECT 1 FROM admin_user_roles 
    WHERE admin_user_id = moderation_actions.admin_user_id 
    AND role = ANY (ARRAY['admin_master'::admin_role, 'moderador_contenido'::admin_role])
  )
);

CREATE POLICY "Admin users can view moderation actions" 
ON moderation_actions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM admin_user_roles 
    WHERE admin_user_id = ANY (
      SELECT id FROM admin_users WHERE is_active = true
    )
    AND role = ANY (ARRAY['admin_master'::admin_role, 'moderador_contenido'::admin_role])
  )
);