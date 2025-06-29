
-- Habilitar RLS en shopping_lists si no está habilitado
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios puedan ver sus propias listas
CREATE POLICY "Users can view their own shopping lists" 
ON public.shopping_lists 
FOR SELECT 
USING (auth.uid() = user_id);

-- Política para que los usuarios puedan crear sus propias listas
CREATE POLICY "Users can create their own shopping lists" 
ON public.shopping_lists 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Política para que los usuarios puedan actualizar sus propias listas
CREATE POLICY "Users can update their own shopping lists" 
ON public.shopping_lists 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Política para que los usuarios puedan eliminar sus propias listas
CREATE POLICY "Users can delete their own shopping lists" 
ON public.shopping_lists 
FOR DELETE 
USING (auth.uid() = user_id);

-- Habilitar RLS en shopping_list_items si no está habilitado
ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios puedan ver items de sus listas
CREATE POLICY "Users can view items from their shopping lists" 
ON public.shopping_list_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.shopping_lists 
    WHERE shopping_lists.id = shopping_list_items.shopping_list_id 
    AND shopping_lists.user_id = auth.uid()
  )
);

-- Política para que los usuarios puedan crear items en sus listas
CREATE POLICY "Users can create items in their shopping lists" 
ON public.shopping_list_items 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.shopping_lists 
    WHERE shopping_lists.id = shopping_list_items.shopping_list_id 
    AND shopping_lists.user_id = auth.uid()
  )
);

-- Política para que los usuarios puedan actualizar items de sus listas
CREATE POLICY "Users can update items in their shopping lists" 
ON public.shopping_list_items 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.shopping_lists 
    WHERE shopping_lists.id = shopping_list_items.shopping_list_id 
    AND shopping_lists.user_id = auth.uid()
  )
);

-- Política para que los usuarios puedan eliminar items de sus listas
CREATE POLICY "Users can delete items from their shopping lists" 
ON public.shopping_list_items 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.shopping_lists 
    WHERE shopping_lists.id = shopping_list_items.shopping_list_id 
    AND shopping_lists.user_id = auth.uid()
  )
);
