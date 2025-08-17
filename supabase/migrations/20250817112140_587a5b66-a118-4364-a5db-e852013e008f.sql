-- Function to get measurement units
CREATE OR REPLACE FUNCTION public.get_measurement_units()
RETURNS TABLE(id uuid, name text, code text, category text, sort_order integer)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT id, name, code, category, sort_order
  FROM measurement_units
  WHERE is_active = true
  ORDER BY sort_order, name;
$$;

-- Function to get cuisines
CREATE OR REPLACE FUNCTION public.get_cuisines()
RETURNS TABLE(id uuid, name text, slug text, sort_order integer)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT id, name, slug, sort_order
  FROM cuisines
  WHERE is_active = true
  ORDER BY sort_order, name;
$$;