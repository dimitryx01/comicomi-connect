-- Eliminar la restricción única general que impide múltiples solicitudes del mismo usuario para el mismo restaurante
-- Mantener solo la restricción única parcial para solicitudes pendientes
ALTER TABLE restaurant_admin_requests 
DROP CONSTRAINT IF EXISTS restaurant_admin_requests_requester_user_id_restaurant_id_key;