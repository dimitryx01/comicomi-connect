
-- Agregar foreign key constraint para relacionar shared_posts con users (solo si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'shared_posts_sharer_id_fkey'
    ) THEN
        ALTER TABLE shared_posts 
        ADD CONSTRAINT shared_posts_sharer_id_fkey 
        FOREIGN KEY (sharer_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Crear índices para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_shared_posts_sharer_id ON shared_posts(sharer_id);
CREATE INDEX IF NOT EXISTS idx_shared_posts_created_at ON shared_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shared_posts_type_id ON shared_posts(shared_type, shared_post_id, shared_recipe_id, shared_restaurant_id);

-- Habilitar Row Level Security si no está habilitado
ALTER TABLE shared_posts ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes y recrearlas
DROP POLICY IF EXISTS "Users can view all shared posts" ON shared_posts;
DROP POLICY IF EXISTS "Users can create their own shared posts" ON shared_posts;
DROP POLICY IF EXISTS "Users can update their own shared posts" ON shared_posts;
DROP POLICY IF EXISTS "Users can delete their own shared posts" ON shared_posts;

-- Crear políticas RLS para shared_posts
CREATE POLICY "Users can view all shared posts" ON shared_posts
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own shared posts" ON shared_posts
  FOR INSERT WITH CHECK (auth.uid() = sharer_id);

CREATE POLICY "Users can update their own shared posts" ON shared_posts
  FOR UPDATE USING (auth.uid() = sharer_id);

CREATE POLICY "Users can delete their own shared posts" ON shared_posts
  FOR DELETE USING (auth.uid() = sharer_id);
