-- Corregir la función is_valid_admin_user para incluir search_path
CREATE OR REPLACE FUNCTION is_valid_admin_user(admin_id UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = admin_id AND is_active = true
  );
END;
$$;