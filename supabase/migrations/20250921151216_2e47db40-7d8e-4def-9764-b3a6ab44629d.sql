-- Create cities table for unique municipalities
CREATE TABLE public.cities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  municipality TEXT NOT NULL,
  province TEXT NOT NULL,
  autonomous_community TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  search_terms TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(municipality, province, autonomous_community)
);

-- Create postal codes table linked to cities
CREATE TABLE public.postal_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  postal_code TEXT NOT NULL,
  area_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(postal_code, city_id)
);

-- Migrate existing location data to new structure (fixed aggregate issue)
INSERT INTO cities (municipality, province, autonomous_community, latitude, longitude, search_terms)
SELECT DISTINCT 
  municipality,
  province,
  autonomous_community,
  AVG(latitude) as avg_latitude,
  AVG(longitude) as avg_longitude,
  ARRAY[]::TEXT[] as search_terms_placeholder
FROM locations 
WHERE is_active = true
GROUP BY municipality, province, autonomous_community;

-- Migrate postal codes
INSERT INTO postal_codes (city_id, postal_code)
SELECT DISTINCT
  c.id,
  l.postal_code
FROM locations l
JOIN cities c ON (
  c.municipality = l.municipality AND 
  c.province = l.province AND 
  c.autonomous_community = l.autonomous_community
)
WHERE l.postal_code IS NOT NULL AND l.is_active = true;

-- Create function to search cities (without postal codes)
CREATE OR REPLACE FUNCTION public.search_cities_intelligent(
  search_query TEXT,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE(
  id UUID,
  municipality TEXT,
  province TEXT,
  autonomous_community TEXT,
  full_location TEXT,
  relevance_score INTEGER
)
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  WITH search_terms AS (
    SELECT 
      c.id,
      c.municipality,
      c.province,
      c.autonomous_community,
      c.municipality || ', ' || c.province || ', ' || c.autonomous_community as full_location,
      CASE 
        WHEN LOWER(c.municipality) = LOWER(search_query) THEN 100
        WHEN LOWER(c.municipality) LIKE '%' || LOWER(search_query) || '%' THEN 80
        WHEN LOWER(c.province) = LOWER(search_query) THEN 70
        WHEN LOWER(c.province) LIKE '%' || LOWER(search_query) || '%' THEN 60
        WHEN LOWER(c.autonomous_community) = LOWER(search_query) THEN 50
        WHEN LOWER(c.autonomous_community) LIKE '%' || LOWER(search_query) || '%' THEN 40
        ELSE 0
      END as relevance_score
    FROM public.cities c
    WHERE c.is_active = true
  )
  SELECT 
    st.id,
    st.municipality,
    st.province,
    st.autonomous_community,
    st.full_location,
    st.relevance_score
  FROM search_terms st
  WHERE st.relevance_score > 0
  ORDER BY st.relevance_score DESC, st.municipality ASC
  LIMIT p_limit;
$function$;

-- Create function to get postal codes for a city
CREATE OR REPLACE FUNCTION public.get_postal_codes_for_city(
  city_id_param UUID
)
RETURNS TABLE(
  postal_code TEXT,
  area_name TEXT
)
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    pc.postal_code,
    pc.area_name
  FROM public.postal_codes pc
  WHERE pc.city_id = city_id_param 
    AND pc.is_active = true
  ORDER BY pc.postal_code;
$function$;

-- Create function to validate postal code for a city
CREATE OR REPLACE FUNCTION public.validate_postal_code_for_city(
  city_id_param UUID,
  postal_code_param TEXT
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS(
    SELECT 1 FROM public.postal_codes pc
    WHERE pc.city_id = city_id_param 
      AND pc.postal_code = postal_code_param
      AND pc.is_active = true
  );
$function$;

-- Enable RLS on new tables
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.postal_codes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Cities are public" ON public.cities FOR SELECT USING (true);
CREATE POLICY "Postal codes are public" ON public.postal_codes FOR SELECT USING (true);

-- Add indexes for performance
CREATE INDEX idx_cities_municipality ON cities(municipality);
CREATE INDEX idx_cities_province ON cities(province);
CREATE INDEX idx_postal_codes_city_id ON postal_codes(city_id);
CREATE INDEX idx_postal_codes_code ON postal_codes(postal_code);