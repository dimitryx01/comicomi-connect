-- Migrate existing restaurant location data to new centralized system
UPDATE restaurants 
SET location_id = 'a65e8efd-a47a-4aac-938d-42ee4c0e6d89'
WHERE location ILIKE '%Barcelona%' AND location_id IS NULL;

UPDATE restaurants 
SET location_id = 'fbc978b2-2abb-4e17-a9bb-b88649a6f386'
WHERE location ILIKE '%Valencia%' AND location_id IS NULL;

UPDATE restaurants 
SET location_id = 'a2cd7707-3d67-467d-9802-420702ed5c56'
WHERE location ILIKE '%Madrid%' AND location_id IS NULL;

-- Migrate existing user city data to new centralized system
UPDATE users 
SET home_location_id = 'a65e8efd-a47a-4aac-938d-42ee4c0e6d89'
WHERE city ILIKE '%Barcelona%' AND home_location_id IS NULL;

UPDATE users 
SET home_location_id = 'fbc978b2-2abb-4e17-a9bb-b88649a6f386'
WHERE city ILIKE '%Valencia%' AND home_location_id IS NULL;

UPDATE users 
SET home_location_id = 'be8dd3db-2a55-4f46-bad7-957337b4a7b7'
WHERE city ILIKE '%Alcobendas%' AND home_location_id IS NULL;