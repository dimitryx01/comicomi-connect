-- Mejorar la función de búsqueda de ciudades sin usar la extensión unaccent
DROP FUNCTION IF EXISTS public.search_cities_intelligent(text, integer);

CREATE OR REPLACE FUNCTION public.search_cities_intelligent(search_query text, p_limit integer DEFAULT 20)
RETURNS TABLE(
  id uuid, 
  municipality text, 
  province text, 
  autonomous_community text, 
  full_location text, 
  relevance_score integer
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  WITH normalized_query AS (
    SELECT 
      LOWER(TRIM(search_query)) as query_lower,
      -- Normalización básica de caracteres especiales comunes en español
      LOWER(TRIM(
        REPLACE(
          REPLACE(
            REPLACE(
              REPLACE(
                REPLACE(
                  REPLACE(
                    REPLACE(
                      REPLACE(
                        REPLACE(
                          REPLACE(search_query, 'á', 'a'), 
                        'à', 'a'), 
                      'â', 'a'), 
                    'ä', 'a'), 
                  'é', 'e'), 
                'è', 'e'), 
              'ê', 'e'), 
            'í', 'i'), 
          'ï', 'i'), 
        'ó', 'o')
      )) as query_unaccent
  ),
  search_results AS (
    SELECT 
      l.id,
      l.municipality,
      l.province,
      l.autonomous_community,
      l.municipality || ', ' || l.province || ', ' || l.autonomous_community as full_location,
      CASE 
        -- Coincidencia exacta con municipio (mayor relevancia)
        WHEN LOWER(l.municipality) = nq.query_lower THEN 100
        
        -- Municipio empieza con la búsqueda
        WHEN LOWER(l.municipality) LIKE nq.query_lower || '%' THEN 90
        WHEN LOWER(l.municipality) LIKE nq.query_unaccent || '%' THEN 85
        
        -- Coincidencia parcial con municipio
        WHEN LOWER(l.municipality) LIKE '%' || nq.query_lower || '%' THEN 80
        WHEN LOWER(l.municipality) LIKE '%' || nq.query_unaccent || '%' THEN 75
        
        -- Coincidencia con términos de búsqueda
        WHEN EXISTS (
          SELECT 1 FROM unnest(COALESCE(l.search_terms, ARRAY[]::text[])) AS term 
          WHERE LOWER(term) = nq.query_lower
        ) THEN 88
        WHEN EXISTS (
          SELECT 1 FROM unnest(COALESCE(l.search_terms, ARRAY[]::text[])) AS term 
          WHERE LOWER(term) LIKE nq.query_lower || '%'
        ) THEN 78
        WHEN EXISTS (
          SELECT 1 FROM unnest(COALESCE(l.search_terms, ARRAY[]::text[])) AS term 
          WHERE LOWER(term) LIKE '%' || nq.query_lower || '%'
        ) THEN 68
        WHEN EXISTS (
          SELECT 1 FROM unnest(COALESCE(l.search_terms, ARRAY[]::text[])) AS term 
          WHERE LOWER(term) LIKE nq.query_unaccent || '%'
        ) THEN 73
        WHEN EXISTS (
          SELECT 1 FROM unnest(COALESCE(l.search_terms, ARRAY[]::text[])) AS term 
          WHERE LOWER(term) LIKE '%' || nq.query_unaccent || '%'
        ) THEN 63
        
        -- Coincidencia con provincia
        WHEN LOWER(l.province) = nq.query_lower THEN 70
        WHEN LOWER(l.province) LIKE '%' || nq.query_lower || '%' THEN 60
        WHEN LOWER(l.province) LIKE '%' || nq.query_unaccent || '%' THEN 55
        
        -- Coincidencia con comunidad autónoma
        WHEN LOWER(l.autonomous_community) = nq.query_lower THEN 50
        WHEN LOWER(l.autonomous_community) LIKE '%' || nq.query_lower || '%' THEN 40
        WHEN LOWER(l.autonomous_community) LIKE '%' || nq.query_unaccent || '%' THEN 35
        
        -- Coincidencia con código postal
        WHEN l.postal_code LIKE search_query || '%' THEN 92
        
        ELSE 0
      END as relevance_score
    FROM public.locations l
    CROSS JOIN normalized_query nq
    WHERE l.is_active = true
      AND LENGTH(TRIM(search_query)) >= 2
  )
  SELECT 
    sr.id,
    sr.municipality,
    sr.province,
    sr.autonomous_community,
    sr.full_location,
    sr.relevance_score
  FROM search_results sr
  WHERE sr.relevance_score > 0
  ORDER BY sr.relevance_score DESC, sr.municipality ASC
  LIMIT p_limit;
$function$;

-- Actualizar search_terms para Sant Cugat con más variaciones
UPDATE locations 
SET search_terms = ARRAY['sant cugat', 'san cugat', 'sant cuga', 'san cuga', 'cugat', 'valles', 'vallès']
WHERE municipality = 'Sant Cugat del Vallès' AND province = 'Barcelona';

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_locations_search_terms ON locations USING GIN(search_terms);
CREATE INDEX IF NOT EXISTS idx_locations_municipality_lower ON locations (LOWER(municipality));
CREATE INDEX IF NOT EXISTS idx_locations_province_lower ON locations (LOWER(province));