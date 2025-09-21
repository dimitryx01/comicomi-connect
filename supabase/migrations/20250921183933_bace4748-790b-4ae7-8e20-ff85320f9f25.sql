-- Add remaining Catalan cities for Girona, Lleida and Tarragona provinces

-- Girona Province Cities (continued)
INSERT INTO locations (municipality, province, autonomous_community, latitude, longitude, postal_code, search_terms) VALUES
('Girona', 'Girona', 'Cataluña', 41.9794, 2.8214, '17001', ARRAY['girona', 'gerona']),
('Figueres', 'Girona', 'Cataluña', 42.2678, 2.9614, '17600', ARRAY['figueres', 'figueras']),
('Blanes', 'Girona', 'Cataluña', 41.6750, 2.7969, '17300', ARRAY['blanes']),
('Lloret de Mar', 'Girona', 'Cataluña', 41.6989, 2.8456, '17310', ARRAY['lloret']),
('Olot', 'Girona', 'Cataluña', 42.1817, 2.4906, '17800', ARRAY['olot']),
('Salt', 'Girona', 'Cataluña', 41.9736, 2.8036, '17190', ARRAY['salt']),
('Palafrugell', 'Girona', 'Cataluña', 41.9194, 3.1642, '17200', ARRAY['palafrugell']),
('Sant Feliu de Guíxols', 'Girona', 'Cataluña', 41.7839, 3.0342, '17220', ARRAY['sant feliu guixols']),
('Roses', 'Girona', 'Cataluña', 42.2617, 3.1775, '17480', ARRAY['roses', 'rosas']),
('Castell-Platja d''Aro', 'Girona', 'Cataluña', 41.8172, 3.0703, '17250', ARRAY['castell platja aro']),
('Palamós', 'Girona', 'Cataluña', 41.8486, 3.1289, '17230', ARRAY['palamos', 'palamós']),
('L''Escala', 'Girona', 'Cataluña', 42.1239, 3.1369, '17130', ARRAY['escala']),
('Ripoll', 'Girona', 'Cataluña', 42.2033, 2.1933, '17500', ARRAY['ripoll']),
('Banyoles', 'Girona', 'Cataluña', 42.1181, 2.7653, '17820', ARRAY['banyoles', 'bañolas']),
('Tossa de Mar', 'Girona', 'Cataluña', 41.7197, 2.9311, '17320', ARRAY['tossa']),
('Puigcerdà', 'Girona', 'Cataluña', 42.4319, 1.9258, '17520', ARRAY['puigcerda']),
('Santa Coloma de Farners', 'Girona', 'Cataluña', 41.8561, 2.6653, '17430', ARRAY['santa coloma farners']),
('Torroella de Montgrí', 'Girona', 'Cataluña', 42.0408, 3.1286, '17257', ARRAY['torroella montgri']),
('Cadaqués', 'Girona', 'Cataluña', 42.2889, 3.2794, '17488', ARRAY['cadaques', 'cadaqués']),
('Empuriabrava', 'Girona', 'Cataluña', 42.2467, 3.1236, '17487', ARRAY['empuriabrava']),
('Cassà de la Selva', 'Girona', 'Cataluña', 41.9089, 2.8731, '17244', ARRAY['cassa selva']),
('Celrà', 'Girona', 'Cataluña', 41.9700, 2.8472, '17460', ARRAY['celra', 'celrà']),
('Llagostera', 'Girona', 'Cataluña', 41.8289, 2.8906, '17240', ARRAY['llagostera']),
('Platja d''Aro', 'Girona', 'Cataluña', 41.8172, 3.0703, '17250', ARRAY['platja aro']),
('Sant Hilari Sacalm', 'Girona', 'Cataluña', 41.8639, 2.5136, '17403', ARRAY['sant hilari']),
('Sarrià de Ter', 'Girona', 'Cataluña', 41.9656, 2.8281, '17840', ARRAY['sarria ter']),
('Vilafant', 'Girona', 'Cataluña', 42.2636, 2.9600, '17740', ARRAY['vilafant']),
('Besalú', 'Girona', 'Cataluña', 42.1975, 2.6978, '17850', ARRAY['besalu', 'besalú']),
('Caldes de Malavella', 'Girona', 'Cataluña', 41.8394, 2.7794, '17455', ARRAY['caldes malavella']),
('Anglès', 'Girona', 'Cataluña', 41.9658, 2.6336, '17160', ARRAY['angles', 'anglès']),
('Llançà', 'Girona', 'Cataluña', 42.3653, 3.1536, '17490', ARRAY['llanca', 'llançà']),
('Portbou', 'Girona', 'Cataluña', 42.4236, 3.1592, '17497', ARRAY['portbou']),
('Colera', 'Girona', 'Cataluña', 42.3894, 3.1569, '17496', ARRAY['colera']),
('El Port de la Selva', 'Girona', 'Cataluña', 42.3344, 3.2028, '17489', ARRAY['port selva']),
('Vidreres', 'Girona', 'Cataluña', 41.7831, 2.7831, '17411', ARRAY['vidreres']),
('Arbúcies', 'Girona', 'Cataluña', 41.8169, 2.5175, '17401', ARRAY['arbucies', 'arbúcies']),
('Hostalric', 'Girona', 'Cataluña', 41.7744, 2.6281, '17450', ARRAY['hostalric']),
('Ribes de Freser', 'Girona', 'Cataluña', 42.3036, 2.1669, '17534', ARRAY['ribes freser']),
('Camprodon', 'Girona', 'Cataluña', 42.3114, 2.3669, '17867', ARRAY['camprodon']),

-- Lleida Province Cities (continued)
('Lleida', 'Lleida', 'Cataluña', 41.6175, 0.6200, '25001', ARRAY['lleida', 'lérida']),
('Balaguer', 'Lleida', 'Cataluña', 41.7889, 0.8058, '25600', ARRAY['balaguer']),
('Mollerussa', 'Lleida', 'Cataluña', 41.6264, 0.8944, '25230', ARRAY['mollerussa']),
('Tàrrega', 'Lleida', 'Cataluña', 41.6450, 1.1397, '25300', ARRAY['tarrega', 'tárrega']),
('La Seu d''Urgell', 'Lleida', 'Cataluña', 42.3583, 1.4575, '25700', ARRAY['seu urgell']),
('Cervera', 'Lleida', 'Cataluña', 41.6703, 1.2714, '25200', ARRAY['cervera']),
('Agramunt', 'Lleida', 'Cataluña', 41.7889, 1.0981, '25310', ARRAY['agramunt']),
('Almacelles', 'Lleida', 'Cataluña', 41.7225, 0.4736, '25100', ARRAY['almacelles']),
('Tremp', 'Lleida', 'Cataluña', 42.1669, 0.8944, '25620', ARRAY['tremp']),
('Solsona', 'Lleida', 'Cataluña', 41.9942, 1.5186, '25280', ARRAY['solsona']),
('Sort', 'Lleida', 'Cataluña', 42.4089, 1.1306, '25560', ARRAY['sort']),
('Vielha e Mijaran', 'Lleida', 'Cataluña', 42.7000, 0.7986, '25530', ARRAY['vielha', 'viella']),
('Artesa de Segre', 'Lleida', 'Cataluña', 41.9000, 1.0333, '25730', ARRAY['artesa segre']),
('Alcarràs', 'Lleida', 'Cataluña', 41.7294, 0.5522, '25180', ARRAY['alcarras', 'alcarràs']),
('Torrefarrera', 'Lleida', 'Cataluña', 41.6564, 0.6203, '25123', ARRAY['torrefarrera']),
('Bell-lloc d''Urgell', 'Lleida', 'Cataluña', 41.6306, 0.7664, '25220', ARRAY['bell-lloc urgell']),
('Ponts', 'Lleida', 'Cataluña', 41.9083, 1.1969, '25740', ARRAY['ponts']),
('Soses', 'Lleida', 'Cataluña', 41.7389, 0.4522, '25111', ARRAY['soses']),
('Torres de Segre', 'Lleida', 'Cataluña', 41.7122, 0.5306, '25170', ARRAY['torres segre']),
('Fraga', 'Lleida', 'Cataluña', 41.5183, 0.3506, '25620', ARRAY['fraga']),
('Binéfar', 'Lleida', 'Cataluña', 41.8583, 0.3206, '22500', ARRAY['binefar', 'binéfar']),
('Monzón', 'Lleida', 'Cataluña', 41.9106, 0.1897, '22400', ARRAY['monzon', 'monzón']),
('Barbastro', 'Lleida', 'Cataluña', 42.0381, 0.1272, '22300', ARRAY['barbastro']),
('Huesca', 'Lleida', 'Cataluña', 42.1361, -0.4081, '22001', ARRAY['huesca']),
('Jaca', 'Lleida', 'Cataluña', 42.5700, -0.5486, '22700', ARRAY['jaca']),
('Sabiñánigo', 'Lleida', 'Cataluña', 42.5186, -0.3781, '22600', ARRAY['sabinanigo', 'sabiñánigo']),
('Ejea de los Caballeros', 'Lleida', 'Cataluña', 42.1267, -1.1381, '50600', ARRAY['ejea caballeros']),
('Aínsa-Sobrarbe', 'Lleida', 'Cataluña', 42.4181, 0.1397, '22330', ARRAY['ainsa', 'sobrarbe']),
('Benasque', 'Lleida', 'Cataluña', 42.6106, 0.5397, '22440', ARRAY['benasque']),

-- Tarragona Province Cities (continued)
('Tarragona', 'Tarragona', 'Cataluña', 41.1189, 1.2445, '43001', ARRAY['tarragona']),
('Reus', 'Tarragona', 'Cataluña', 41.1561, 1.1069, '43201', ARRAY['reus']),
('Salou', 'Tarragona', 'Cataluña', 41.0756, 1.1394, '43840', ARRAY['salou']),
('Cambrils', 'Tarragona', 'Cataluña', 41.0694, 1.0647, '43850', ARRAY['cambrils']),
('Vila-seca', 'Tarragona', 'Cataluña', 41.1108, 1.1472, '43480', ARRAY['vila-seca', 'vilaseca']),
('El Vendrell', 'Tarragona', 'Cataluña', 41.2169, 1.5322, '43700', ARRAY['vendrell']),
('Tortosa', 'Tarragona', 'Cataluña', 40.8122, 0.5203, '43500', ARRAY['tortosa']),
('Amposta', 'Tarragona', 'Cataluña', 40.7119, 0.5814, '43870', ARRAY['amposta']),
('Calafell', 'Tarragona', 'Cataluña', 41.1981, 1.5672, '43820', ARRAY['calafell']),
('Cunit', 'Tarragona', 'Cataluña', 41.2119, 1.6281, '43881', ARRAY['cunit']),
('Sant Pere de Riudebitlles', 'Tarragona', 'Cataluña', 41.4464, 1.7242, '43815', ARRAY['sant pere riudebitlles']),
('Deltebre', 'Tarragona', 'Cataluña', 40.7167, 0.7167, '43580', ARRAY['deltebre']),
('L''Ametlla de Mar', 'Tarragona', 'Cataluña', 40.8847, 0.8022, '43860', ARRAY['ametlla']),
('Valls', 'Tarragona', 'Cataluña', 41.2861, 1.2492, '43800', ARRAY['valls']),
('Constantí', 'Tarragona', 'Cataluña', 41.1653, 1.1942, '43120', ARRAY['constanti', 'constantí']),
('La Selva del Camp', 'Tarragona', 'Cataluña', 41.2133, 1.1375, '43470', ARRAY['selva camp']),
('Montblanc', 'Tarragona', 'Cataluña', 41.3789, 1.1625, '43400', ARRAY['montblanc']),
('Santa Oliva', 'Tarragona', 'Cataluña', 41.2794, 1.5544, '43470', ARRAY['santa oliva']),
('Altafulla', 'Tarragona', 'Cataluña', 41.1481, 1.3822, '43893', ARRAY['altafulla']),
('Riudoms', 'Tarragona', 'Cataluña', 41.1553, 1.0458, '43330', ARRAY['riudoms']),
('Mont-roig del Camp', 'Tarragona', 'Cataluña', 41.0625, 0.9700, '43300', ARRAY['mont-roig']),
('El Morell', 'Tarragona', 'Cataluña', 41.1989, 1.1922, '43760', ARRAY['morell']),
('Falset', 'Tarragona', 'Cataluña', 41.1347, 0.8403, '43730', ARRAY['falset']),
('Ascó', 'Tarragona', 'Cataluña', 41.1889, 0.5706, '43791', ARRAY['asco', 'ascó']),
('Creixell', 'Tarragona', 'Cataluña', 41.1731, 1.4308, '43839', ARRAY['creixell']),
('Gandesa', 'Tarragona', 'Cataluña', 41.0533, 0.4381, '43780', ARRAY['gandesa']),
('L''Arboç', 'Tarragona', 'Cataluña', 41.3186, 1.4889, '43720', ARRAY['arboc']),
('Mora d''Ebre', 'Tarragona', 'Cataluña', 41.0922, 0.6383, '43740', ARRAY['mora ebre']),
('Roquetes', 'Tarragona', 'Cataluña', 40.8236, 0.4806, '43520', ARRAY['roquetes']),
('Sant Carles de la Ràpita', 'Tarragona', 'Cataluña', 40.6128, 0.5925, '43540', ARRAY['sant carles rapita']),
('Sant Jaume d''Enveja', 'Tarragona', 'Cataluña', 40.7236, 0.6833, '43877', ARRAY['sant jaume enveja']),
('Ulldecona', 'Tarragona', 'Cataluña', 40.5831, 0.3469, '43550', ARRAY['ulldecona']),
('Benifallet', 'Tarragona', 'Cataluña', 40.8667, 0.5203, '43514', ARRAY['benifallet']),
('Perelló', 'Tarragona', 'Cataluña', 40.8397, 0.7397, '43519', ARRAY['perello', 'perelló']),
('Vinebre', 'Tarragona', 'Cataluña', 41.2167, 0.6833, '43775', ARRAY['vinebre']),
('Garcia', 'Tarragona', 'Cataluña', 40.9167, 0.5833, '43781', ARRAY['garcia']),
('Pinell de Brai', 'Tarragona', 'Cataluña', 41.0667, 0.4833, '43594', ARRAY['pinell brai']),
('Bot', 'Tarragona', 'Cataluña', 40.9897, 0.3739, '43785', ARRAY['bot']),
('Horta de Sant Joan', 'Tarragona', 'Cataluña', 40.9897, 0.3236, '43596', ARRAY['horta sant joan']),
('Arnes', 'Tarragona', 'Cataluña', 40.9167, 0.2833, '43597', ARRAY['arnes'])
ON CONFLICT (municipality, province, autonomous_community) 
DO UPDATE SET 
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  postal_code = EXCLUDED.postal_code,
  search_terms = EXCLUDED.search_terms,
  updated_at = now();

-- Create additional indexes for performance
CREATE INDEX IF NOT EXISTS idx_locations_search_terms ON locations USING GIN(search_terms);
CREATE INDEX IF NOT EXISTS idx_locations_province ON locations(province);
CREATE INDEX IF NOT EXISTS idx_locations_autonomous_community ON locations(autonomous_community);
CREATE INDEX IF NOT EXISTS idx_locations_coordinates ON locations(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Update postal codes table with additional postal codes for new cities
INSERT INTO postal_codes (city_id, postal_code, area_name) 
SELECT l.id, l.postal_code, 'Centro'
FROM locations l 
WHERE l.postal_code IS NOT NULL 
  AND l.autonomous_community = 'Cataluña'
  AND NOT EXISTS (
    SELECT 1 FROM postal_codes pc 
    WHERE pc.city_id = l.id AND pc.postal_code = l.postal_code
  )
ON CONFLICT (city_id, postal_code) DO NOTHING;