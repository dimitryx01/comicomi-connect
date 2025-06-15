
-- Actualizar la tabla de usuarios para separar nombre/apellidos y ciudad/país
ALTER TABLE public.users 
ADD COLUMN first_name TEXT,
ADD COLUMN last_name TEXT,
ADD COLUMN city TEXT,
ADD COLUMN country TEXT;

-- Opcional: migrar datos existentes si hay alguno
UPDATE public.users 
SET first_name = SPLIT_PART(full_name, ' ', 1),
    last_name = CASE 
        WHEN full_name LIKE '% %' THEN SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1)
        ELSE ''
    END
WHERE full_name IS NOT NULL;

UPDATE public.users 
SET city = SPLIT_PART(location, ', ', 1),
    country = CASE 
        WHEN location LIKE '%, %' THEN SPLIT_PART(location, ', ', 2)
        ELSE location
    END
WHERE location IS NOT NULL;

-- Ahora podemos remover las columnas antiguas si queremos (opcional)
-- ALTER TABLE public.users DROP COLUMN full_name;
-- ALTER TABLE public.users DROP COLUMN location;

-- O mantenerlas por compatibilidad y usar un trigger para sincronizar
CREATE OR REPLACE FUNCTION sync_user_names()
RETURNS TRIGGER AS $$
BEGIN
    -- Sincronizar full_name cuando se actualiza first_name o last_name
    IF NEW.first_name IS NOT NULL OR NEW.last_name IS NOT NULL THEN
        NEW.full_name = TRIM(COALESCE(NEW.first_name, '') || ' ' || COALESCE(NEW.last_name, ''));
    END IF;
    
    -- Sincronizar location cuando se actualiza city o country
    IF NEW.city IS NOT NULL OR NEW.country IS NOT NULL THEN
        NEW.location = CASE 
            WHEN NEW.city IS NOT NULL AND NEW.country IS NOT NULL THEN NEW.city || ', ' || NEW.country
            WHEN NEW.city IS NOT NULL THEN NEW.city
            WHEN NEW.country IS NOT NULL THEN NEW.country
            ELSE NULL
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_user_names_trigger
    BEFORE INSERT OR UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION sync_user_names();
