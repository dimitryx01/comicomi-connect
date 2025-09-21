-- Agregar ciudades catalanas faltantes a la tabla locations
INSERT INTO public.locations (municipality, province, autonomous_community, latitude, longitude, search_terms) VALUES
-- Provincia de Barcelona
('Sant Cugat del Vallès', 'Barcelona', 'Cataluña', 41.4727, 2.0853, ARRAY['sant cugat', 'san cugat']),
('Cornellà de Llobregat', 'Barcelona', 'Cataluña', 41.3536, 2.0741, ARRAY['cornella', 'cornellá']),
('Sant Boi de Llobregat', 'Barcelona', 'Cataluña', 41.3403, 2.0404, ARRAY['sant boi', 'san boi']),
('Rubí', 'Barcelona', 'Cataluña', 41.4928, 2.0285, ARRAY['rubi']),
('Manresa', 'Barcelona', 'Cataluña', 41.7280, 1.8315, ARRAY['manresa']),
('Vilanova i la Geltrú', 'Barcelona', 'Cataluña', 41.2235, 1.7256, ARRAY['vilanova', 'vilanova i la geltru']),
('Granollers', 'Barcelona', 'Cataluña', 41.6079, 2.2877, ARRAY['granollers']),
('Cerdanyola del Vallès', 'Barcelona', 'Cataluña', 41.4912, 2.1405, ARRAY['cerdanyola']),
('El Prat de Llobregat', 'Barcelona', 'Cataluña', 41.3258, 2.0954, ARRAY['el prat', 'prat de llobregat']),
('Igualada', 'Barcelona', 'Cataluña', 41.5789, 1.6173, ARRAY['igualada']),
('Mollet del Vallès', 'Barcelona', 'Cataluña', 41.5404, 2.2136, ARRAY['mollet']),
('Castelldefels', 'Barcelona', 'Cataluña', 41.2816, 1.9755, ARRAY['castelldefels']),
('Gavà', 'Barcelona', 'Cataluña', 41.3068, 2.0015, ARRAY['gava']),
('Viladecans', 'Barcelona', 'Cataluña', 41.3147, 2.0140, ARRAY['viladecans']),
('Montgat', 'Barcelona', 'Cataluña', 41.4695, 2.2737, ARRAY['montgat']),
('Sitges', 'Barcelona', 'Cataluña', 41.2369, 1.8059, ARRAY['sitges']),

-- Provincia de Girona
('Figueres', 'Girona', 'Cataluña', 42.2676, 2.9615, ARRAY['figueres']),
('Blanes', 'Girona', 'Cataluña', 41.6747, 2.7909, ARRAY['blanes']),
('Lloret de Mar', 'Girona', 'Cataluña', 41.6990, 2.8453, ARRAY['lloret', 'lloret de mar']),
('Olot', 'Girona', 'Cataluña', 42.1815, 2.4885, ARRAY['olot']),
('Salt', 'Girona', 'Cataluña', 41.9748, 2.7929, ARRAY['salt']),

-- Provincia de Tarragona
('Tortosa', 'Tarragona', 'Cataluña', 40.8122, 0.5221, ARRAY['tortosa']),
('Salou', 'Tarragona', 'Cataluña', 41.0768, 1.1395, ARRAY['salou']),
('Cambrils', 'Tarragona', 'Cataluña', 41.0697, 1.0648, ARRAY['cambrils']),
('Vila-seca', 'Tarragona', 'Cataluña', 41.1057, 1.1485, ARRAY['vila-seca', 'vilaseca']),
('El Vendrell', 'Tarragona', 'Cataluña', 41.2172, 1.5326, ARRAY['el vendrell', 'vendrell']),

-- Provincia de Lleida
('Balaguer', 'Lleida', 'Cataluña', 41.7895, 0.8046, ARRAY['balaguer']),
('Mollerussa', 'Lleida', 'Cataluña', 41.6290, 0.8988, ARRAY['mollerussa']),
('Tàrrega', 'Lleida', 'Cataluña', 41.6469, 1.1391, ARRAY['tarrega']);

-- Agregar algunos códigos postales de referencia para las ciudades principales
INSERT INTO public.postal_codes (city_id, postal_code, area_name) 
SELECT l.id, pc.postal_code, pc.area_name
FROM public.locations l
CROSS JOIN (VALUES 
    ('Barcelona', '08001', 'Ciutat Vella'),
    ('Barcelona', '08002', 'Eixample'),
    ('Barcelona', '08010', 'Eixample'),
    ('Barcelona', '08025', 'Gràcia'),
    ('Sant Cugat del Vallès', '08190', 'Centro'),
    ('Sant Cugat del Vallès', '08195', 'Zona Residencial'),
    ('Terrassa', '08221', 'Centro'),
    ('Terrassa', '08225', 'Zona Norte'),
    ('Sabadell', '08201', 'Centro'),
    ('Sabadell', '08205', 'Zona Este'),
    ('Badalona', '08911', 'Centro'),
    ('Badalona', '08915', 'Zona Norte'),
    ('Hospitalet de Llobregat', '08901', 'Centro'),
    ('Hospitalet de Llobregat', '08905', 'Zona Sur')
) AS pc(municipality, postal_code, area_name)
WHERE l.municipality = pc.municipality AND l.autonomous_community = 'Cataluña';