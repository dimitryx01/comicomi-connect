-- Insertar códigos postales reales para Barcelona usando la tabla locations
DO $$
DECLARE
  barcelona_location_id uuid;
BEGIN
  -- Buscar el ID de Barcelona en la tabla locations
  SELECT id INTO barcelona_location_id 
  FROM locations 
  WHERE LOWER(municipality) = 'barcelona' 
    AND LOWER(province) = 'barcelona'
    AND is_active = true
  LIMIT 1;
  
  IF barcelona_location_id IS NOT NULL THEN
    -- Insertar códigos postales de Barcelona (08001 a 08042)
    INSERT INTO postal_codes (city_id, postal_code, area_name, is_active) VALUES
    (barcelona_location_id, '08001', 'Ciutat Vella', true),
    (barcelona_location_id, '08002', 'Ciutat Vella', true),
    (barcelona_location_id, '08003', 'Ciutat Vella', true),
    (barcelona_location_id, '08004', 'Ciutat Vella', true),
    (barcelona_location_id, '08005', 'Ciutat Vella', true),
    (barcelona_location_id, '08006', 'Eixample', true),
    (barcelona_location_id, '08007', 'Eixample', true),
    (barcelona_location_id, '08008', 'Eixample', true),
    (barcelona_location_id, '08009', 'Eixample', true),
    (barcelona_location_id, '08010', 'Eixample', true),
    (barcelona_location_id, '08011', 'Sants-Montjuïc', true),
    (barcelona_location_id, '08012', 'Sants-Montjuïc', true),
    (barcelona_location_id, '08013', 'Sants-Montjuïc', true),
    (barcelona_location_id, '08014', 'Sants-Montjuïc', true),
    (barcelona_location_id, '08015', 'Sants-Montjuïc', true),
    (barcelona_location_id, '08016', 'Eixample', true),
    (barcelona_location_id, '08017', 'Sarrià-Sant Gervasi', true),
    (barcelona_location_id, '08018', 'Sants-Montjuïc', true),
    (barcelona_location_id, '08019', 'Sants-Montjuïc', true),
    (barcelona_location_id, '08020', 'Sant Martí', true),
    (barcelona_location_id, '08021', 'Gràcia', true),
    (barcelona_location_id, '08022', 'Sant Martí', true),
    (barcelona_location_id, '08023', 'Sant Martí', true),
    (barcelona_location_id, '08024', 'Gràcia', true),
    (barcelona_location_id, '08025', 'Sant Martí', true),
    (barcelona_location_id, '08026', 'Horta-Guinardó', true),
    (barcelona_location_id, '08027', 'Horta-Guinardó', true),
    (barcelona_location_id, '08028', 'Sants-Montjuïc', true),
    (barcelona_location_id, '08029', 'Les Corts', true),
    (barcelona_location_id, '08030', 'Les Corts', true),
    (barcelona_location_id, '08031', 'Horta-Guinardó', true),
    (barcelona_location_id, '08032', 'Horta-Guinardó', true),
    (barcelona_location_id, '08033', 'Nou Barris', true),
    (barcelona_location_id, '08034', 'Sarrià-Sant Gervasi', true),
    (barcelona_location_id, '08035', 'Horta-Guinardó', true),
    (barcelona_location_id, '08036', 'Eixample', true),
    (barcelona_location_id, '08037', 'Horta-Guinardó', true),
    (barcelona_location_id, '08038', 'Eixample', true),
    (barcelona_location_id, '08039', 'Eixample', true),
    (barcelona_location_id, '08040', 'Eixample', true),
    (barcelona_location_id, '08041', 'Eixample', true),
    (barcelona_location_id, '08042', 'Eixample', true)
    ON CONFLICT (city_id, postal_code) DO NOTHING;
    
    RAISE NOTICE 'Códigos postales insertados para Barcelona: ID %', barcelona_location_id;
  ELSE
    RAISE NOTICE 'No se encontró Barcelona en la tabla locations';
  END IF;
END;
$$;