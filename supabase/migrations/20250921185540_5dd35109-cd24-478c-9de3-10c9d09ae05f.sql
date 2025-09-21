-- Agregar política RLS para permitir que administradores con rol gestor_establecimientos puedan crear restaurantes

-- Primero, verificar las políticas existentes y agregar la nueva política para INSERT de administradores
CREATE POLICY "Admin users can create restaurants" 
ON public.restaurants 
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.admin_user_roles aur
    JOIN public.admin_users au ON aur.admin_user_id = au.id
    WHERE au.id = auth.uid() 
      AND au.is_active = true 
      AND aur.role = 'gestor_establecimientos'::admin_role
  )
);

-- También agregar política para UPDATE por si los administradores necesitan editar restaurantes
CREATE POLICY "Admin users can update restaurants" 
ON public.restaurants 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.admin_user_roles aur
    JOIN public.admin_users au ON aur.admin_user_id = au.id
    WHERE au.id = auth.uid() 
      AND au.is_active = true 
      AND aur.role = 'gestor_establecimientos'::admin_role
  )
);

-- Política para que administradores puedan ver todos los restaurantes
CREATE POLICY "Admin users can view all restaurants" 
ON public.restaurants 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.admin_user_roles aur
    JOIN public.admin_users au ON aur.admin_user_id = au.id
    WHERE au.id = auth.uid() 
      AND au.is_active = true 
      AND aur.role = 'gestor_establecimientos'::admin_role
  )
);

-- Política para DELETE (eliminar restaurantes)
CREATE POLICY "Admin users can delete restaurants" 
ON public.restaurants 
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.admin_user_roles aur
    JOIN public.admin_users au ON aur.admin_user_id = au.id
    WHERE au.id = auth.uid() 
      AND au.is_active = true 
      AND aur.role = 'gestor_establecimientos'::admin_role
  )
);