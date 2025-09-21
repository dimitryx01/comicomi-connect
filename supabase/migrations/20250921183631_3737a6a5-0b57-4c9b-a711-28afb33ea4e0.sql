-- Add comprehensive list of Catalan cities organized by provinces
-- Phase 1: Major cities and municipalities with population > 1,000

-- Barcelona Province Cities
INSERT INTO locations (municipality, province, autonomous_community, latitude, longitude, postal_code, search_terms) VALUES
-- Major cities Barcelona province
('Barcelona', 'Barcelona', 'Cataluña', 41.3851, 2.1734, '08001', ARRAY['barcelona', 'bcn']),
('L''Hospitalet de Llobregat', 'Barcelona', 'Cataluña', 41.3594, 2.1075, '08901', ARRAY['hospitalet', 'lhospitalet']),
('Badalona', 'Barcelona', 'Cataluña', 41.4486, 2.2455, '08911', ARRAY['badalona']),
('Terrassa', 'Barcelona', 'Cataluña', 41.5631, 2.0106, '08221', ARRAY['terrassa', 'tarrasa']),
('Sabadell', 'Barcelona', 'Cataluña', 41.5431, 2.1094, '08201', ARRAY['sabadell']),
('Santa Coloma de Gramenet', 'Barcelona', 'Cataluña', 41.4522, 2.2082, '08921', ARRAY['santa coloma', 'gramenet']),
('Mataró', 'Barcelona', 'Cataluña', 41.5339, 2.4447, '08301', ARRAY['mataro']),
('Sant Cugat del Vallès', 'Barcelona', 'Cataluña', 41.4722, 2.0858, '08190', ARRAY['sant cugat', 'san cugat']),
('Cornellà de Llobregat', 'Barcelona', 'Cataluña', 41.3564, 2.0747, '08940', ARRAY['cornella', 'cornellá']),
('Sant Boi de Llobregat', 'Barcelona', 'Cataluña', 41.3464, 2.0411, '08830', ARRAY['sant boi', 'san boi']),
('Rubí', 'Barcelona', 'Cataluña', 41.4919, 2.0319, '08191', ARRAY['rubi', 'rubí']),
('Manresa', 'Barcelona', 'Cataluña', 41.7279, 1.8262, '08241', ARRAY['manresa']),
('Vilanova i la Geltrú', 'Barcelona', 'Cataluña', 41.2236, 1.7256, '08800', ARRAY['vilanova', 'villanueva']),
('Granollers', 'Barcelona', 'Cataluña', 41.6077, 2.2873, '08401', ARRAY['granollers']),
('Cerdanyola del Vallès', 'Barcelona', 'Cataluña', 41.4911, 2.1403, '08290', ARRAY['cerdanyola']),
('El Prat de Llobregat', 'Barcelona', 'Cataluña', 41.3256, 2.0958, '08820', ARRAY['prat', 'el prat']),
('Igualada', 'Barcelona', 'Cataluña', 41.5789, 1.6175, '08700', ARRAY['igualada']),
('Mollet del Vallès', 'Barcelona', 'Cataluña', 41.5386, 2.2136, '08100', ARRAY['mollet']),
('Castelldefels', 'Barcelona', 'Cataluña', 41.2814, 1.9758, '08860', ARRAY['castelldefels']),
('Gavà', 'Barcelona', 'Cataluña', 41.3064, 2.0011, '08850', ARRAY['gava', 'gavá']),
('Viladecans', 'Barcelona', 'Cataluña', 41.3147, 2.0153, '08840', ARRAY['viladecans']),
('Montcada i Reixac', 'Barcelona', 'Cataluña', 41.4831, 2.1906, '08110', ARRAY['montcada', 'reixac']),
('Esplugues de Llobregat', 'Barcelona', 'Cataluña', 41.3772, 2.0886, '08950', ARRAY['esplugues']),
('Sant Feliu de Llobregat', 'Barcelona', 'Cataluña', 41.3842, 2.0458, '08980', ARRAY['sant feliu']),
('Vic', 'Barcelona', 'Cataluña', 41.9306, 2.2581, '08500', ARRAY['vic']),
('El Masnou', 'Barcelona', 'Cataluña', 41.4808, 2.3089, '08320', ARRAY['masnou']),
('Premià de Mar', 'Barcelona', 'Cataluña', 41.4908, 2.3542, '08330', ARRAY['premia']),
('Barberà del Vallès', 'Barcelona', 'Cataluña', 41.5147, 2.1258, '08210', ARRAY['barbera']),
('Ripollet', 'Barcelona', 'Cataluña', 41.4981, 2.1583, '08291', ARRAY['ripollet']),
('Sitges', 'Barcelona', 'Cataluña', 41.2375, 1.8089, '08870', ARRAY['sitges']),
('Montgat', 'Barcelona', 'Cataluña', 41.4675, 2.2808, '08390', ARRAY['montgat']),
('Martorell', 'Barcelona', 'Cataluña', 41.4728, 1.9264, '08760', ARRAY['martorell']),
('Pineda de Mar', 'Barcelona', 'Cataluña', 41.6225, 2.6881, '08397', ARRAY['pineda']),
('Sant Pere de Ribes', 'Barcelona', 'Cataluña', 41.2611, 1.7675, '08810', ARRAY['sant pere ribes']),
('Parets del Vallès', 'Barcelona', 'Cataluña', 41.5736, 2.2306, '08150', ARRAY['parets']),
('La Garriga', 'Barcelona', 'Cataluña', 41.6842, 2.2881, '08530', ARRAY['garriga']),
('Berga', 'Barcelona', 'Cataluña', 42.1000, 1.8450, '08600', ARRAY['berga']),
('Cardedeu', 'Barcelona', 'Cataluña', 41.6389, 2.3522, '08440', ARRAY['cardedeu']),
('Arenys de Mar', 'Barcelona', 'Cataluña', 41.5797, 2.5531, '08350', ARRAY['arenys']),
('Canet de Mar', 'Barcelona', 'Cataluña', 41.5931, 2.5842, '08360', ARRAY['canet']),
('Sant Andreu de la Barca', 'Barcelona', 'Cataluña', 41.4469, 1.9736, '08740', ARRAY['sant andreu barca']),
('Molins de Rei', 'Barcelona', 'Cataluña', 41.4122, 2.0197, '08750', ARRAY['molins rei']),
('Sant Joan Despí', 'Barcelona', 'Cataluña', 41.3672, 2.0597, '08970', ARRAY['sant joan despi']),

-- Girona Province Cities
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

-- Lleida Province Cities
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

-- Tarragona Province Cities
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
('Vila-real', 'Tarragona', 'Cataluña', 39.9394, -0.1000, '12540', ARRAY['vila-real', 'villarreal']),
('La Selva del Camp', 'Tarragona', 'Cataluña', 41.2133, 1.1375, '43470', ARRAY['selva camp']),
('Montblanc', 'Tarragona', 'Cataluña', 41.3789, 1.1625, '43400', ARRAY['montblanc']),
('Santa Oliva', 'Tarragona', 'Cataluña', 41.2794, 1.5544, '43470', ARRAY['santa oliva']),
('Altafulla', 'Tarragona', 'Cataluña', 41.1481, 1.3822, '43893', ARRAY['altafulla']),
('Peñíscola', 'Tarragona', 'Cataluña', 40.3608, 0.4078, '12598', ARRAY['peniscola', 'peñíscola']),
('Riudoms', 'Tarragona', 'Cataluña', 41.1553, 1.0458, '43330', ARRAY['riudoms']),
('Mont-roig del Camp', 'Tarragona', 'Cataluña', 41.0625, 0.9700, '43300', ARRAY['mont-roig']),
('El Morell', 'Tarragona', 'Cataluña', 41.1989, 1.1922, '43760', ARRAY['morell']),
('Falset', 'Tarragona', 'Cataluña', 41.1347, 0.8403, '43730', ARRAY['falset']),

-- Additional smaller but important municipalities
('Arenys de Munt', 'Barcelona', 'Cataluña', 41.6097, 2.5519, '08358', ARRAY['arenys munt']),
('Argentona', 'Barcelona', 'Cataluña', 41.5553, 2.4031, '08310', ARRAY['argentona']),
('Begues', 'Barcelona', 'Cataluña', 41.3264, 1.9181, '08859', ARRAY['begues']),
('Caldes de Montbui', 'Barcelona', 'Cataluña', 41.6331, 2.1681, '08140', ARRAY['caldes montbui']),
('Calella', 'Barcelona', 'Cataluña', 41.6122, 2.6583, '08370', ARRAY['calella']),
('Canovelles', 'Barcelona', 'Cataluña', 41.6186, 2.2828, '08420', ARRAY['canovelles']),
('Capellades', 'Barcelona', 'Cataluña', 41.5356, 1.6819, '08786', ARRAY['capellades']),
('Cubelles', 'Barcelona', 'Cataluña', 41.2072, 1.6692, '08880', ARRAY['cubelles']),
('L''Ametlla del Vallès', 'Barcelona', 'Cataluña', 41.6678, 2.2622, '08480', ARRAY['ametlla valles']),
('Lliçà de Vall', 'Barcelona', 'Cataluña', 41.5881, 2.2406, '08185', ARRAY['llica vall']),
('Llinars del Vallès', 'Barcelona', 'Cataluña', 41.6364, 2.3189, '08450', ARRAY['llinars']),
('Malgrat de Mar', 'Barcelona', 'Cataluña', 41.6478, 2.7425, '08380', ARRAY['malgrat']),
('Piera', 'Barcelona', 'Cataluña', 41.5278, 1.7431, '08783', ARRAY['piera']),
('Sant Esteve Sesrovires', 'Barcelona', 'Cataluña', 41.4733, 1.8981, '08635', ARRAY['sant esteve sesrovires']),
('Sant Quirze del Vallès', 'Barcelona', 'Cataluña', 41.5350, 2.0731, '08192', ARRAY['sant quirze']),
('Sant Sadurní d''Anoia', 'Barcelona', 'Cataluña', 41.4303, 1.7781, '08770', ARRAY['sant sadurni']),
('Santa Margarida de Montbui', 'Barcelona', 'Cataluña', 41.6139, 1.8339, '08710', ARRAY['santa margarida montbui']),
('Santa Perpètua de Mogoda', 'Barcelona', 'Cataluña', 41.5344, 2.1831, '08130', ARRAY['santa perpetua']),
('Subirats', 'Barcelona', 'Cataluña', 41.4125, 1.8236, '08739', ARRAY['subirats']),
('Teià', 'Barcelona', 'Cataluña', 41.4994, 2.3125, '08329', ARRAY['teia', 'teià']),
('Torelló', 'Barcelona', 'Cataluña', 42.0481, 2.2631, '08570', ARRAY['torello', 'torelló']),
('Vallirana', 'Barcelona', 'Cataluña', 41.3833, 1.9333, '08759', ARRAY['vallirana']),
('Vilassar de Mar', 'Barcelona', 'Cataluña', 41.5072, 2.3919, '08340', ARRAY['vilassar mar']),
('Vilassar de Dalt', 'Barcelona', 'Cataluña', 41.5164, 2.3622, '08339', ARRAY['vilassar dalt']),

-- More Girona cities
('Cassà de la Selva', 'Girona', 'Cataluña', 41.9089, 2.8731, '17244', ARRAY['cassa selva']),
('Celrà', 'Girona', 'Cataluña', 41.9700, 2.8472, '17460', ARRAY['celra', 'celrà']),
('Llagostera', 'Girona', 'Cataluña', 41.8289, 2.8906, '17240', ARRAY['llagostera']),
('Platja d''Aro', 'Girona', 'Cataluña', 41.8172, 3.0703, '17250', ARRAY['platja aro']),
('Sant Hilari Sacalm', 'Girona', 'Cataluña', 41.8639, 2.5136, '17403', ARRAY['sant hilari']),
('Sarrià de Ter', 'Girona', 'Cataluña', 41.9656, 2.8281, '17840', ARRAY['sarria ter']),
('Vilafant', 'Girona', 'Cataluña', 42.2636, 2.9600, '17740', ARRAY['vilafant']),

-- More Lleida cities
('Ponts', 'Lleida', 'Cataluña', 41.9083, 1.1969, '25740', ARRAY['ponts']),
('Soses', 'Lleida', 'Cataluña', 41.7389, 0.4522, '25111', ARRAY['soses']),
('Torres de Segre', 'Lleida', 'Cataluña', 41.7122, 0.5306, '25170', ARRAY['torres segre']),

-- More Tarragona cities
('Ascó', 'Tarragona', 'Cataluña', 41.1889, 0.5706, '43791', ARRAY['asco', 'ascó']),
('Creixell', 'Tarragona', 'Cataluña', 41.1731, 1.4308, '43839', ARRAY['creixell']),
('Gandesa', 'Tarragona', 'Cataluña', 41.0533, 0.4381, '43780', ARRAY['gandesa']),
('L''Arboç', 'Tarragona', 'Cataluña', 41.3186, 1.4889, '43720', ARRAY['arboc']),
('Mora d''Ebre', 'Tarragona', 'Cataluña', 41.0922, 0.6383, '43740', ARRAY['mora ebre']),
('Roquetes', 'Tarragona', 'Cataluña', 40.8236, 0.4806, '43520', ARRAY['roquetes']),
('Sant Carles de la Ràpita', 'Tarragona', 'Cataluña', 40.6128, 0.5925, '43540', ARRAY['sant carles rapita']),
('Sant Jaume d''Enveja', 'Tarragona', 'Cataluña', 40.7236, 0.6833, '43877', ARRAY['sant jaume enveja']),
('Ulldecona', 'Tarragona', 'Cataluña', 40.5831, 0.3469, '43550', ARRAY['ulldecona'])

ON CONFLICT (municipality, province, autonomous_community) 
DO UPDATE SET 
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  postal_code = EXCLUDED.postal_code,
  search_terms = EXCLUDED.search_terms,
  updated_at = now();

-- Create indexes for better performance
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