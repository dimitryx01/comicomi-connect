-- Corregir error de cheers en comentarios de publicaciones compartidas
-- Problema: La restricción de clave foránea impide dar cheers a comentarios de shared_post_comments

-- Remover la restricción de clave foránea restrictiva que solo permite comment_id de la tabla comments
DO $$ 
BEGIN
  -- Verificar si la restricción existe y eliminarla
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'comment_cheers_comment_id_fkey' 
    AND table_name = 'comment_cheers'
  ) THEN
    ALTER TABLE comment_cheers DROP CONSTRAINT comment_cheers_comment_id_fkey;
    RAISE NOTICE 'Restricción de clave foránea comment_cheers_comment_id_fkey eliminada';
  ELSE
    RAISE NOTICE 'La restricción comment_cheers_comment_id_fkey no existe';
  END IF;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Error al intentar eliminar la restricción: %', SQLERRM;
END $$;

-- Verificar que los índices necesarios existan para performance
CREATE INDEX IF NOT EXISTS idx_comment_cheers_comment_id ON comment_cheers(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_cheers_user_comment ON comment_cheers(user_id, comment_id);

-- Comentario informativo sobre la validación
-- La integridad de datos ahora se maneja a nivel de aplicación
-- Los hooks verifican que comment_id existe en una de las tablas válidas:
-- - comments (post comments)
-- - recipe_comments (recipe comments) 
-- - shared_post_comments (shared post comments)