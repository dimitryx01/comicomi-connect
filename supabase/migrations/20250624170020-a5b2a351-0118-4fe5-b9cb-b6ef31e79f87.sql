
-- Consolidar políticas duplicadas finales en la tabla users

-- Eliminar las políticas duplicadas para SELECT en users
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;

-- Crear una sola política consolidada que permita ver perfiles públicos
-- Esta política permite que todos vean todos los perfiles (comportamiento público)
-- Si necesitas restringir la visibilidad, puedes modificar la condición
CREATE POLICY "Everyone can view user profiles" 
  ON public.users 
  FOR SELECT 
  USING (true);
