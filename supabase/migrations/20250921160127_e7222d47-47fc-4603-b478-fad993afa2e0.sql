-- Mejorar la función de validación de códigos postales para manejar formatos con y sin ceros iniciales
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
      -- También buscar la versión sin ceros iniciales
      LTRIM(postal_code_param, '0') as stripped_postal_code
  )
  SELECT EXISTS (
    SELECT 1 
    FROM postal_codes pc
    WHERE pc.city_id = city_id_param 
      AND pc.is_active = true
      AND (
        pc.postal_code = (SELECT normalized_postal_code FROM normalized_code)
        OR pc.postal_code = (SELECT stripped_postal_code FROM normalized_code)
        OR LPAD(pc.postal_code, 5, '0') = (SELECT normalized_postal_code FROM normalized_code)
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

-- Insertar códigos postales reales para Barcelona (08001-08042)
DO $$
DECLARE
  barcelona_city_id uuid;
  postal_code_num integer;
BEGIN
  -- Buscar el ID de Barcelona
  SELECT id INTO barcelona_city_id 
  FROM locations 
  WHERE LOWER(municipality) = 'barcelona' 
    AND LOWER(province) = 'barcelona'
    AND is_active = true
  LIMIT 1;
  
  IF barcelona_city_id IS NOT NULL THEN
    -- Insertar códigos postales de Barcelona (08001 a 08042)
    FOR postal_code_num IN 1..42 LOOP
      INSERT INTO postal_codes (city_id, postal_code, area_name, is_active)
      VALUES (
        barcelona_city_id,
        LPAD(postal_code_num::text, 5, '0800'),
        CASE 
          WHEN postal_code_num <= 10 THEN 'Ciutat Vella'
          WHEN postal_code_num <= 20 THEN 'Eixample'
          WHEN postal_code_num <= 30 THEN 'Sants-Montjuïc'
          WHEN postal_code_num <= 35 THEN 'Les Corts'
          WHEN postal_code_num <= 40 THEN 'Sarrià-Sant Gervasi'
          ELSE 'Altres districtes'
        END,
        true
      )
      ON CONFLICT (city_id, postal_code) DO NOTHING;
    END LOOP;
    
    RAISE NOTICE 'Códigos postales insertados para Barcelona: ID %', barcelona_city_id;
  ELSE
    RAISE NOTICE 'No se encontró Barcelona en la tabla locations';
  END IF;
END;
$$;

-- Insertar algunos códigos postales para Madrid (28001-28052)
DO $$
DECLARE
  madrid_city_id uuid;
  postal_code_num integer;
BEGIN
  -- Buscar el ID de Madrid
  SELECT id INTO madrid_city_id 
  FROM locations 
  WHERE LOWER(municipality) = 'madrid' 
    AND LOWER(province) = 'madrid'
    AND is_active = true
  LIMIT 1;
  
  IF madrid_city_id IS NOT NULL THEN
    -- Insertar códigos postales de Madrid (28001 a 28052)
    FOR postal_code_num IN 1..52 LOOP
      INSERT INTO postal_codes (city_id, postal_code, area_name, is_active)
      VALUES (
        madrid_city_id,
        CASE 
          WHEN postal_code_num < 10 THEN '2800' || postal_code_num::text
          ELSE '280' || postal_code_num::text
        END,
        CASE 
          WHEN postal_code_num <= 10 THEN 'Centro'
          WHEN postal_code_num <= 20 THEN 'Arganzuela'
          WHEN postal_code_num <= 30 THEN 'Retiro'
          WHEN postal_code_num <= 40 THEN 'Salamanca'
          WHEN postal_code_num <= 50 THEN 'Chamartín'
          ELSE 'Otros distritos'
        END,
        true
      )
      ON CONFLICT (city_id, postal_code) DO NOTHING;
    END LOOP;
    
    RAISE NOTICE 'Códigos postales insertados para Madrid: ID %', madrid_city_id;
  ELSE
    RAISE NOTICE 'No se encontró Madrid en la tabla locations';
  END IF;
END;
$$;