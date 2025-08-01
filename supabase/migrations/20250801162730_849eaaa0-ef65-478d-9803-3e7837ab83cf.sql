-- Crear políticas RLS para que administradores puedan eliminar contenido

-- Política para eliminar posts
CREATE POLICY "Admin users can delete any post" 
ON public.posts 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM admin_user_roles aur
    JOIN admin_users au ON aur.admin_user_id = au.id
    WHERE au.id = auth.uid() 
    AND au.is_active = true
    AND aur.role IN ('admin_master', 'moderador_contenido')
  )
);

-- Política para eliminar recipes
CREATE POLICY "Admin users can delete any recipe" 
ON public.recipes 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM admin_user_roles aur
    JOIN admin_users au ON aur.admin_user_id = au.id
    WHERE au.id = auth.uid() 
    AND au.is_active = true
    AND aur.role IN ('admin_master', 'moderador_contenido')
  )
);

-- Política para eliminar comments
CREATE POLICY "Admin users can delete any comment" 
ON public.comments 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM admin_user_roles aur
    JOIN admin_users au ON aur.admin_user_id = au.id
    WHERE au.id = auth.uid() 
    AND au.is_active = true
    AND aur.role IN ('admin_master', 'moderador_contenido')
  )
);

-- Política para eliminar recipe_comments
CREATE POLICY "Admin users can delete any recipe comment" 
ON public.recipe_comments 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM admin_user_roles aur
    JOIN admin_users au ON aur.admin_user_id = au.id
    WHERE au.id = auth.uid() 
    AND au.is_active = true
    AND aur.role IN ('admin_master', 'moderador_contenido')
  )
);

-- Política para eliminar shared_posts
CREATE POLICY "Admin users can delete any shared post" 
ON public.shared_posts 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM admin_user_roles aur
    JOIN admin_users au ON aur.admin_user_id = au.id
    WHERE au.id = auth.uid() 
    AND au.is_active = true
    AND aur.role IN ('admin_master', 'moderador_contenido')
  )
);

-- Política para eliminar shared_post_comments
CREATE POLICY "Admin users can delete any shared post comment" 
ON public.shared_post_comments 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM admin_user_roles aur
    JOIN admin_users au ON aur.admin_user_id = au.id
    WHERE au.id = auth.uid() 
    AND au.is_active = true
    AND aur.role IN ('admin_master', 'moderador_contenido')
  )
);