-- Agregar tipo de cocina "Internacional" para establecimientos con menús variados
INSERT INTO cuisines (name, slug, sort_order, is_active) 
VALUES ('Internacional', 'internacional', 0, true)
ON CONFLICT (slug) DO NOTHING;