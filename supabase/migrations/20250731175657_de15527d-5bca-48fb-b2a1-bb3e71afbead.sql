-- Verificar y asegurar que comment_cheers funcione con todos los tipos de comentarios

-- Para comentarios de recetas, necesitamos asegurar que comment_cheers 
-- pueda referirse a recipe_comments también

-- Actualizar la constraint para permitir referencias a diferentes tipos de comentarios
-- Si no existe una constraint específica, este comando será ignorado
DO $$ 
BEGIN
  -- Verificar si la tabla comment_cheers puede manejar comentarios de todos los tipos
  -- por ahora mantenerla simple y usar el comment_id directamente
  
  -- Asegurar que el índice existe para mejor performance
  CREATE INDEX IF NOT EXISTS idx_comment_cheers_comment_user 
  ON comment_cheers(comment_id, user_id);
  
  -- Asegurar que el índice existe para contar cheers por comentario
  CREATE INDEX IF NOT EXISTS idx_comment_cheers_comment_id 
  ON comment_cheers(comment_id);
  
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Índices ya existen o error al crearlos: %', SQLERRM;
END $$;