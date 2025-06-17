
-- Verificar y crear políticas RLS para la tabla users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios puedan ver solo su propio perfil
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" 
  ON public.users 
  FOR SELECT 
  USING (auth.uid() = id);

-- Política para que los usuarios puedan actualizar solo su propio perfil
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" 
  ON public.users 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Política para que los usuarios puedan insertar su propio perfil
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" 
  ON public.users 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Verificar y crear políticas RLS para la tabla user_interests
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios puedan ver solo sus propios intereses
DROP POLICY IF EXISTS "Users can view own interests" ON public.user_interests;
CREATE POLICY "Users can view own interests" 
  ON public.user_interests 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para que los usuarios puedan insertar solo sus propios intereses
DROP POLICY IF EXISTS "Users can insert own interests" ON public.user_interests;
CREATE POLICY "Users can insert own interests" 
  ON public.user_interests 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Política para que los usuarios puedan eliminar solo sus propios intereses
DROP POLICY IF EXISTS "Users can delete own interests" ON public.user_interests;
CREATE POLICY "Users can delete own interests" 
  ON public.user_interests 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Hacer que las tablas de intereses y categorías sean públicamente legibles
-- para que los usuarios puedan ver las opciones disponibles
ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view interests" ON public.interests;
CREATE POLICY "Anyone can view interests" 
  ON public.interests 
  FOR SELECT 
  TO public
  USING (true);

ALTER TABLE public.interest_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view interest categories" ON public.interest_categories;
CREATE POLICY "Anyone can view interest categories" 
  ON public.interest_categories 
  FOR SELECT 
  TO public
  USING (true);
