-- Primero, mejorar las funciones sin insertar datos
CREATE OR REPLACE FUNCTION public.validate_postal_code_for_city(city_id_param uuid, postal_code_param text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- Normalizar el código postal: asegurar que tenga 5 dígitos con ceros iniciales
  WITH normalized_code AS (
    SELECT 
      LPAD(postal_code_param, 5, '0') as normalized_postal_code,
      -- También buscar la versión sin ceros iniciales si tiene menos de 5 dígitos
      CASE 
        WHEN LENGTH(postal_code_param) < 5 THEN LPAD(postal_code_param, 5, '0')
        ELSE postal_code_param
      END as formatted_code
  )
  SELECT EXISTS (
    SELECT 1 
    FROM postal_codes pc
    WHERE pc.city_id = city_id_param 
      AND pc.is_active = true
      AND (
        pc.postal_code = postal_code_param
        OR pc.postal_code = (SELECT normalized_postal_code FROM normalized_code)
        OR pc.postal_code = (SELECT formatted_code FROM normalized_code)
        OR LPAD(pc.postal_code, 5, '0') = LPAD(postal_code_param, 5, '0')
      )
  );
$$;

-- Función para obtener códigos postales con formato normalizado
CREATE OR REPLACE FUNCTION public.get_postal_codes_for_city(city_id_param uuid)
RETURNS TABLE(postal_code text, area_name text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    LPAD(pc.postal_code, 5, '0') as postal_code,
    pc.area_name
  FROM postal_codes pc
  WHERE pc.city_id = city_id_param 
    AND pc.is_active = true
  ORDER BY pc.postal_code;
$$;