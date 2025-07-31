-- Verificar la estructura de comment_cheers y asegurar compatibilidad con todos los tipos de comentarios

-- Verificar si la tabla comment_cheers puede manejar todos los tipos de comentarios
-- Los IDs de comentarios son únicos entre todas las tablas debido a gen_random_uuid()

-- Crear un tipo enum para el tipo de comentario (opcional, para mejor organización futura)
DO $$ 
BEGIN
  -- Verificar si el tipo ya existe
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'comment_type') THEN
    CREATE TYPE comment_type AS ENUM ('post_comment', 'recipe_comment', 'shared_post_comment');
  END IF;
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'El tipo comment_type ya existe';
END $$;

-- Opcionalmente agregar una columna comment_type a comment_cheers para mejor organización
-- Esta columna es opcional y no afecta la funcionalidad actual
DO $$ 
BEGIN
  -- Verificar si la columna ya existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'comment_cheers' 
    AND column_name = 'comment_type'
  ) THEN
    ALTER TABLE comment_cheers 
    ADD COLUMN comment_type comment_type DEFAULT 'post_comment';
    
    -- Crear índice para mejor performance si se usa el filtro por tipo
    CREATE INDEX IF NOT EXISTS idx_comment_cheers_type 
    ON comment_cheers(comment_type);
  END IF;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Column comment_type already exists or could not be added: %', SQLERRM;
END $$;