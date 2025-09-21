-- ========================================
-- FASE 1: CREAR ESTRUCTURA DE UBICACIONES CENTRALIZADA
-- ========================================

-- Crear tabla principal de ubicaciones de España
CREATE TABLE public.locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  municipality TEXT NOT NULL,
  province TEXT NOT NULL,
  autonomous_community TEXT NOT NULL,
  postal_code TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  search_terms TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear índices para búsquedas eficientes
CREATE INDEX idx_locations_municipality ON public.locations(municipality);
CREATE INDEX idx_locations_province ON public.locations(province);
CREATE INDEX idx_locations_autonomous_community ON public.locations(autonomous_community);
CREATE INDEX idx_locations_postal_code ON public.locations(postal_code);
CREATE INDEX idx_locations_search_terms ON public.locations USING GIN(search_terms);
CREATE INDEX idx_locations_coordinates ON public.locations(latitude, longitude);

-- Crear tabla de mapeo de términos multiidioma
CREATE TABLE public.address_term_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  spanish_term TEXT NOT NULL,
  catalan_term TEXT NOT NULL,
  galician_term TEXT,
  basque_term TEXT,
  term_type TEXT NOT NULL, -- 'street', 'avenue', 'square', etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear índices para mapeo de términos
CREATE INDEX idx_address_mappings_spanish ON public.address_term_mappings(spanish_term);
CREATE INDEX idx_address_mappings_catalan ON public.address_term_mappings(catalan_term);
CREATE INDEX idx_address_mappings_type ON public.address_term_mappings(term_type);

-- ========================================
-- FASE 2: ACTUALIZAR TABLAS EXISTENTES
-- ========================================

-- Actualizar tabla restaurants
ALTER TABLE public.restaurants 
ADD COLUMN location_id UUID REFERENCES public.locations(id),
ADD COLUMN street_address TEXT;

-- Actualizar tabla users
ALTER TABLE public.users 
ADD COLUMN home_location_id UUID REFERENCES public.locations(id);

-- ========================================
-- FASE 3: POBLAR DATOS DE ESPAÑA
-- ========================================

-- Poblar mapeo de términos español-catalán
INSERT INTO public.address_term_mappings (spanish_term, catalan_term, term_type) VALUES
('calle', 'carrer', 'street'),
('avenida', 'avinguda', 'avenue'),
('plaza', 'plaça', 'square'),
('paseo', 'passeig', 'promenade'),
('ronda', 'ronda', 'ring_road'),
('camino', 'camí', 'path'),
('travesía', 'travessia', 'cross_street'),
('callejón', 'carreró', 'alley'),
('glorieta', 'glorieta', 'roundabout'),
('boulevard', 'bulevard', 'boulevard'),
('rambla', 'rambla', 'rambla'),
('vía', 'via', 'way'),
('carretera', 'carretera', 'highway'),
('autopista', 'autopista', 'motorway'),
('polígono', 'polígon', 'industrial_area');

-- Poblar ubicaciones principales de España (muestra representativa)
-- ANDALUCÍA
INSERT INTO public.locations (municipality, province, autonomous_community, postal_code, latitude, longitude, search_terms) VALUES
('Sevilla', 'Sevilla', 'Andalucía', '41001', 37.3891, -5.9845, ARRAY['sevilla', 'seville']),
('Málaga', 'Málaga', 'Andalucía', '29001', 36.7213, -4.4214, ARRAY['málaga', 'malaga']),
('Córdoba', 'Córdoba', 'Andalucía', '14001', 37.8882, -4.7794, ARRAY['córdoba', 'cordoba']),
('Granada', 'Granada', 'Andalucía', '18001', 37.1773, -3.5986, ARRAY['granada']),
('Cádiz', 'Cádiz', 'Andalucía', '11001', 36.5297, -6.2924, ARRAY['cádiz', 'cadiz']),
('Almería', 'Almería', 'Andalucía', '04001', 36.8381, -2.4597, ARRAY['almería', 'almeria']),
('Huelva', 'Huelva', 'Andalucía', '21001', 37.2614, -6.9447, ARRAY['huelva']),
('Jaén', 'Jaén', 'Andalucía', '23001', 37.7796, -3.7849, ARRAY['jaén', 'jaen']),
('Marbella', 'Málaga', 'Andalucía', '29600', 36.5109, -4.8851, ARRAY['marbella']),
('Jerez de la Frontera', 'Cádiz', 'Andalucía', '11400', 36.6868, -6.1370, ARRAY['jerez', 'jerez de la frontera']),

-- CATALUÑA
('Barcelona', 'Barcelona', 'Cataluña', '08001', 41.3851, 2.1734, ARRAY['barcelona']),
('Hospitalet de Llobregat', 'Barcelona', 'Cataluña', '08901', 41.3598, 2.0989, ARRAY['hospitalet', 'hospitalet de llobregat']),
('Badalona', 'Barcelona', 'Cataluña', '08911', 41.4509, 2.2447, ARRAY['badalona']),
('Terrassa', 'Barcelona', 'Cataluña', '08221', 41.5647, 2.0084, ARRAY['terrassa']),
('Sabadell', 'Barcelona', 'Cataluña', '08201', 41.5439, 2.1094, ARRAY['sabadell']),
('Lleida', 'Lleida', 'Cataluña', '25001', 41.6176, 0.6200, ARRAY['lleida', 'lérida']),
('Tarragona', 'Tarragona', 'Cataluña', '43001', 41.1189, 1.2445, ARRAY['tarragona']),
('Mataró', 'Barcelona', 'Cataluña', '08301', 41.5339, 2.4455, ARRAY['mataró', 'mataro']),
('Santa Coloma de Gramenet', 'Barcelona', 'Cataluña', '08921', 41.4518, 2.2081, ARRAY['santa coloma', 'santa coloma de gramenet']),
('Girona', 'Girona', 'Cataluña', '17001', 41.9794, 2.8214, ARRAY['girona', 'gerona']),

-- MADRID
('Madrid', 'Madrid', 'Madrid', '28001', 40.4168, -3.7038, ARRAY['madrid']),
('Móstoles', 'Madrid', 'Madrid', '28931', 40.3227, -3.8649, ARRAY['móstoles', 'mostoles']),
('Fuenlabrada', 'Madrid', 'Madrid', '28940', 40.2841, -3.7953, ARRAY['fuenlabrada']),
('Leganés', 'Madrid', 'Madrid', '28911', 40.3273, -3.7636, ARRAY['leganés', 'leganes']),
('Getafe', 'Madrid', 'Madrid', '28901', 40.3058, -3.7327, ARRAY['getafe']),
('Alcalá de Henares', 'Madrid', 'Madrid', '28801', 40.4817, -3.3659, ARRAY['alcalá de henares', 'alcala de henares']),
('Alcorcón', 'Madrid', 'Madrid', '28921', 40.3459, -3.8264, ARRAY['alcorcón', 'alcorcon']),
('Torrejón de Ardoz', 'Madrid', 'Madrid', '28850', 40.4556, -3.4844, ARRAY['torrejón', 'torrejon', 'torrejón de ardoz']),
('Parla', 'Madrid', 'Madrid', '28980', 40.2378, -3.7739, ARRAY['parla']),
('Alcobendas', 'Madrid', 'Madrid', '28100', 40.5412, -3.6398, ARRAY['alcobendas']),

-- VALENCIA
('Valencia', 'Valencia', 'Valencia', '46001', 39.4699, -0.3763, ARRAY['valencia', 'valència']),
('Alicante', 'Alicante', 'Valencia', '03001', 38.3452, -0.4810, ARRAY['alicante', 'alacant']),
('Elche', 'Alicante', 'Valencia', '03201', 38.2622, -0.7011, ARRAY['elche', 'elx']),
('Castellón de la Plana', 'Castellón', 'Valencia', '12001', 39.9864, -0.0513, ARRAY['castellón', 'castelló', 'castellón de la plana']),

-- PAÍS VASCO
('Bilbao', 'Vizcaya', 'País Vasco', '48001', 43.2627, -2.9253, ARRAY['bilbao']),
('Vitoria-Gasteiz', 'Álava', 'País Vasco', '01001', 42.8467, -2.6716, ARRAY['vitoria', 'gasteiz', 'vitoria-gasteiz']),
('Donostia-San Sebastián', 'Guipúzcoa', 'País Vasco', '20001', 43.3183, -1.9812, ARRAY['donostia', 'san sebastián', 'donostia-san sebastián']),

-- GALICIA
('A Coruña', 'A Coruña', 'Galicia', '15001', 43.3623, -8.4115, ARRAY['a coruña', 'la coruña', 'coruña']),
('Vigo', 'Pontevedra', 'Galicia', '36201', 42.2328, -8.7226, ARRAY['vigo']),
('Ourense', 'Ourense', 'Galicia', '32001', 42.3405, -7.8644, ARRAY['ourense', 'orense']),
('Lugo', 'Lugo', 'Galicia', '27001', 43.0097, -7.5567, ARRAY['lugo']),
('Santiago de Compostela', 'A Coruña', 'Galicia', '15701', 42.8782, -8.5448, ARRAY['santiago', 'santiago de compostela']),

-- ASTURIAS
('Oviedo', 'Asturias', 'Asturias', '33001', 43.3614, -5.8593, ARRAY['oviedo']),
('Gijón', 'Asturias', 'Asturias', '33201', 43.5322, -5.6611, ARRAY['gijón', 'gijon']),

-- ARAGÓN
('Zaragoza', 'Zaragoza', 'Aragón', '50001', 41.6488, -0.8891, ARRAY['zaragoza']),

-- CASTILLA Y LEÓN
('Valladolid', 'Valladolid', 'Castilla y León', '47001', 41.6520, -4.7245, ARRAY['valladolid']),
('Burgos', 'Burgos', 'Castilla y León', '09001', 42.3439, -3.6969, ARRAY['burgos']),
('Salamanca', 'Salamanca', 'Castilla y León', '37001', 40.9701, -5.6635, ARRAY['salamanca']),
('León', 'León', 'Castilla y León', '24001', 42.5987, -5.5671, ARRAY['león', 'leon']),

-- CASTILLA-LA MANCHA
('Albacete', 'Albacete', 'Castilla-La Mancha', '02001', 38.9942, -1.8564, ARRAY['albacete']),

-- MURCIA
('Murcia', 'Murcia', 'Murcia', '30001', 37.9922, -1.1307, ARRAY['murcia']),
('Cartagena', 'Murcia', 'Murcia', '30201', 37.6000, -0.9864, ARRAY['cartagena']),

-- NAVARRA
('Pamplona', 'Navarra', 'Navarra', '31001', 42.8125, -1.6458, ARRAY['pamplona', 'iruña']),

-- LA RIOJA
('Logroño', 'La Rioja', 'La Rioja', '26001', 42.4627, -2.4447, ARRAY['logroño', 'logrono']),

-- CANTABRIA
('Santander', 'Cantabria', 'Cantabria', '39001', 43.4623, -3.8099, ARRAY['santander']),

-- EXTREMADURA
('Badajoz', 'Badajoz', 'Extremadura', '06001', 38.8794, -6.9706, ARRAY['badajoz']),

-- ISLAS BALEARES
('Palma', 'Islas Baleares', 'Islas Baleares', '07001', 39.5696, 2.6502, ARRAY['palma', 'palma de mallorca']),

-- CANARIAS
('Las Palmas de Gran Canaria', 'Las Palmas', 'Canarias', '35001', 28.1000, -15.4130, ARRAY['las palmas', 'las palmas de gran canaria']),
('Santa Cruz de Tenerife', 'Santa Cruz de Tenerife', 'Canarias', '38001', 28.4636, -16.2518, ARRAY['santa cruz de tenerife', 'santa cruz']),
('Telde', 'Las Palmas', 'Canarias', '35200', 27.9920, -15.4186, ARRAY['telde']),

-- OTROS MUNICIPIOS IMPORTANTES
('Reus', 'Tarragona', 'Cataluña', '43201', 41.1557, 1.1074, ARRAY['reus']),
('Dos Hermanas', 'Sevilla', 'Andalucía', '41701', 37.2816, -5.9201, ARRAY['dos hermanas']),
('Algeciras', 'Cádiz', 'Andalucía', '11201', 36.1408, -5.4526, ARRAY['algeciras']);

-- ========================================
-- FASE 4: FUNCIONES DE BÚSQUEDA INTELIGENTE
-- ========================================

-- Función para búsqueda inteligente de ubicaciones
CREATE OR REPLACE FUNCTION public.search_locations_intelligent(search_query TEXT, p_limit INTEGER DEFAULT 20)
RETURNS TABLE(
  id UUID,
  municipality TEXT,
  province TEXT,
  autonomous_community TEXT,
  postal_code TEXT,
  full_location TEXT,
  relevance_score INTEGER
)
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH search_terms AS (
    SELECT 
      l.id,
      l.municipality,
      l.province,
      l.autonomous_community,
      l.postal_code,
      l.municipality || ', ' || l.province || ', ' || l.autonomous_community as full_location,
      CASE 
        -- Coincidencia exacta con municipio (mayor relevancia)
        WHEN LOWER(l.municipality) = LOWER(search_query) THEN 100
        -- Coincidencia parcial con municipio
        WHEN LOWER(l.municipality) LIKE '%' || LOWER(search_query) || '%' THEN 80
        -- Coincidencia con provincia
        WHEN LOWER(l.province) = LOWER(search_query) THEN 70
        WHEN LOWER(l.province) LIKE '%' || LOWER(search_query) || '%' THEN 60
        -- Coincidencia con comunidad autónoma
        WHEN LOWER(l.autonomous_community) = LOWER(search_query) THEN 50
        WHEN LOWER(l.autonomous_community) LIKE '%' || LOWER(search_query) || '%' THEN 40
        -- Coincidencia con código postal
        WHEN l.postal_code LIKE search_query || '%' THEN 90
        -- Coincidencia con términos de búsqueda
        WHEN EXISTS (
          SELECT 1 FROM unnest(l.search_terms) AS term 
          WHERE LOWER(term) LIKE '%' || LOWER(search_query) || '%'
        ) THEN 85
        ELSE 0
      END as relevance_score
    FROM public.locations l
    WHERE l.is_active = true
  )
  SELECT 
    st.id,
    st.municipality,
    st.province,
    st.autonomous_community,
    st.postal_code,
    st.full_location,
    st.relevance_score
  FROM search_terms st
  WHERE st.relevance_score > 0
  ORDER BY st.relevance_score DESC, st.municipality ASC
  LIMIT p_limit;
$$;

-- Función para obtener ubicación por coordenadas (para geolocalización futura)
CREATE OR REPLACE FUNCTION public.get_location_by_coordinates(lat DECIMAL, lng DECIMAL, radius_km INTEGER DEFAULT 50)
RETURNS TABLE(
  id UUID,
  municipality TEXT,
  province TEXT,
  autonomous_community TEXT,
  distance_km DECIMAL
)
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    l.id,
    l.municipality,
    l.province,
    l.autonomous_community,
    ROUND(
      6371 * acos(
        cos(radians(lat)) * cos(radians(l.latitude)) * 
        cos(radians(l.longitude) - radians(lng)) + 
        sin(radians(lat)) * sin(radians(l.latitude))
      )::numeric, 2
    ) as distance_km
  FROM public.locations l
  WHERE l.is_active = true
    AND l.latitude IS NOT NULL 
    AND l.longitude IS NOT NULL
    AND (
      6371 * acos(
        cos(radians(lat)) * cos(radians(l.latitude)) * 
        cos(radians(l.longitude) - radians(lng)) + 
        sin(radians(lat)) * sin(radians(l.latitude))
      )
    ) <= radius_km
  ORDER BY distance_km ASC
  LIMIT 10;
$$;

-- Función actualizada para obtener restaurantes por ubicación
CREATE OR REPLACE FUNCTION public.get_random_restaurants_by_location(
  location_id_param UUID, 
  limit_count INTEGER DEFAULT 8
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  description TEXT,
  image_url TEXT,
  cover_image_url TEXT,
  location_name TEXT,
  cuisine_type TEXT,
  followers_count INTEGER
)
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    r.id,
    r.name,
    r.description,
    r.image_url,
    r.cover_image_url,
    l.municipality || ', ' || l.province as location_name,
    r.cuisine_type,
    COALESCE(f.followers_count, 0)::integer as followers_count
  FROM restaurants r
  LEFT JOIN locations l ON r.location_id = l.id
  LEFT JOIN (
    SELECT 
      followed_restaurant_id,
      COUNT(*) as followers_count
    FROM user_follows
    WHERE followed_restaurant_id IS NOT NULL
    GROUP BY followed_restaurant_id
  ) f ON r.id = f.followed_restaurant_id
  WHERE r.location_id = location_id_param
    AND l.is_active = true
  ORDER BY random()
  LIMIT limit_count;
$$;

-- Función mejorada para obtener restaurantes por ciudad (compatibilidad)
CREATE OR REPLACE FUNCTION public.get_random_restaurants_by_city(
  user_city TEXT, 
  limit_count INTEGER DEFAULT 8
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  description TEXT,
  image_url TEXT,
  cover_image_url TEXT,
  location TEXT,
  cuisine_type TEXT,
  followers_count INTEGER
)
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    r.id,
    r.name,
    r.description,
    r.image_url,
    r.cover_image_url,
    COALESCE(l.municipality || ', ' || l.province, r.location) as location,
    r.cuisine_type,
    COALESCE(f.followers_count, 0)::integer as followers_count
  FROM restaurants r
  LEFT JOIN locations l ON r.location_id = l.id
  LEFT JOIN (
    SELECT 
      followed_restaurant_id,
      COUNT(*) as followers_count
    FROM user_follows
    WHERE followed_restaurant_id IS NOT NULL
    GROUP BY followed_restaurant_id
  ) f ON r.id = f.followed_restaurant_id
  WHERE (
    -- Búsqueda en nueva estructura
    (l.municipality ILIKE '%' || user_city || '%' OR l.province ILIKE '%' || user_city || '%')
    OR
    -- Búsqueda en estructura antigua (compatibilidad)
    (r.location_id IS NULL AND (r.location ILIKE '%' || user_city || '%' OR r.address ILIKE '%' || user_city || '%'))
  )
  AND (l.is_active IS NULL OR l.is_active = true)
  ORDER BY random()
  LIMIT limit_count;
$$;

-- Habilitar RLS en las nuevas tablas
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.address_term_mappings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para locations (públicas para lectura)
CREATE POLICY "Everyone can view locations" ON public.locations
  FOR SELECT USING (true);

-- Políticas RLS para address_term_mappings (públicas para lectura)
CREATE POLICY "Everyone can view address mappings" ON public.address_term_mappings
  FOR SELECT USING (true);

-- Trigger para actualizar updated_at en locations
CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON public.locations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();