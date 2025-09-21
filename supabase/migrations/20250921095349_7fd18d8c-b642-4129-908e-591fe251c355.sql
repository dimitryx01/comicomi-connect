-- Crear tabla de relación many-to-many entre restaurantes y tipos de cocina
CREATE TABLE IF NOT EXISTS public.restaurant_cuisines (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  cuisine_id uuid NOT NULL REFERENCES public.cuisines(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(restaurant_id, cuisine_id)
);

-- Habilitar RLS en la nueva tabla
ALTER TABLE public.restaurant_cuisines ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS para restaurant_cuisines
CREATE POLICY "Everyone can view restaurant cuisines"
  ON public.restaurant_cuisines FOR SELECT
  USING (true);

CREATE POLICY "Restaurant admins can manage restaurant cuisines"
  ON public.restaurant_cuisines FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM restaurant_admins ra
      WHERE ra.restaurant_id = restaurant_cuisines.restaurant_id 
      AND ra.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM restaurant_admins ra
      WHERE ra.restaurant_id = restaurant_cuisines.restaurant_id 
      AND ra.user_id = auth.uid()
    )
  );

-- Migrar datos existentes de cuisine_type a la nueva tabla
INSERT INTO public.restaurant_cuisines (restaurant_id, cuisine_id)
SELECT 
  r.id as restaurant_id,
  c.id as cuisine_id
FROM public.restaurants r
JOIN public.cuisines c ON c.name = r.cuisine_type
WHERE r.cuisine_type IS NOT NULL
AND r.cuisine_type != ''
ON CONFLICT (restaurant_id, cuisine_id) DO NOTHING;

-- Crear función para obtener tipos de cocina de un restaurante
CREATE OR REPLACE FUNCTION public.get_restaurant_cuisine_types(restaurant_uuid uuid)
RETURNS text[]
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(array_agg(c.name ORDER BY c.sort_order), ARRAY[]::text[])
  FROM restaurant_cuisines rc
  JOIN cuisines c ON rc.cuisine_id = c.id
  WHERE rc.restaurant_id = restaurant_uuid;
$$;

-- Crear función para obtener restaurantes por tipo de cocina
CREATE OR REPLACE FUNCTION public.get_restaurants_by_cuisine(cuisine_names text[])
RETURNS TABLE(
  id uuid,
  name text,
  description text,
  location text,
  cuisine_types text[]
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT
    r.id,
    r.name,
    r.description,
    r.location,
    get_restaurant_cuisine_types(r.id) as cuisine_types
  FROM restaurants r
  JOIN restaurant_cuisines rc ON r.id = rc.restaurant_id
  JOIN cuisines c ON rc.cuisine_id = c.id
  WHERE c.name = ANY(cuisine_names)
  ORDER BY r.name;
$$;