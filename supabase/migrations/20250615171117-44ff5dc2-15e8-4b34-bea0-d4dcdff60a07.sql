
-- ========================================
-- COMICOMI - BASE DE DATOS COMPLETA
-- ========================================

-- 1. USUARIOS
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  cooking_level TEXT CHECK (cooking_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  dietary_restrictions TEXT[],
  favorite_cuisines TEXT[],
  onboarding_completed BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. RESTAURANTES
CREATE TABLE public.restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  cuisine_type TEXT,
  owner_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  image_url TEXT,
  cover_image_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. ADMINISTRADORES DE RESTAURANTES
CREATE TABLE public.restaurant_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'admin', 'manager')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (restaurant_id, user_id)
);

-- 4. RECETAS
CREATE TABLE public.recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  video_url TEXT,
  ingredients JSONB, -- [{name: "tomate", quantity: "2", unit: "pcs"}]
  steps JSONB, -- [{step: 1, description: "...", image_url: "...", duration: 300}]
  prep_time INTEGER, -- en minutos
  cook_time INTEGER, -- en minutos
  total_time INTEGER, -- en minutos
  servings INTEGER DEFAULT 1,
  cuisine_type TEXT,
  difficulty TEXT CHECK (difficulty IN ('fácil','media','difícil')),
  allergens TEXT[], -- ["gluten", "lactose", "nuts"]
  tags TEXT[], -- ["rápida", "saludable", "vegana"]
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. POSTS (Sistema social)
CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  content TEXT,
  post_type TEXT CHECK (post_type IN ('general', 'food_photo', 'experience', 'tip', 'story')),
  media_urls JSONB, -- [{type: "image", url: "...", thumbnail: "..."}, {type: "video", url: "...", duration: 30}]
  recipe_id uuid REFERENCES public.recipes(id) ON DELETE SET NULL,
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE SET NULL,
  location TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. SISTEMA DE CHEERS (reemplaza likes)
CREATE TABLE public.cheers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  recipe_id uuid REFERENCES public.recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  -- Solo uno puede estar lleno a la vez
  CHECK (
    (post_id IS NOT NULL AND recipe_id IS NULL) OR
    (post_id IS NULL AND recipe_id IS NOT NULL)
  ),
  UNIQUE (user_id, post_id),
  UNIQUE (user_id, recipe_id)
);

-- 7. COMENTARIOS (para posts y recetas)
CREATE TABLE public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  recipe_id uuid REFERENCES public.recipes(id) ON DELETE CASCADE,
  parent_comment_id uuid REFERENCES public.comments(id) ON DELETE CASCADE, -- Para respuestas
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  -- Solo uno puede estar lleno a la vez
  CHECK (
    (post_id IS NOT NULL AND recipe_id IS NULL) OR
    (post_id IS NULL AND recipe_id IS NOT NULL)
  )
);

-- 8. CHEERS EN COMENTARIOS
CREATE TABLE public.comment_cheers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, comment_id)
);

-- 9. RESEÑAS DE RESTAURANTES (multidimensionales)
CREATE TABLE public.restaurant_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE,
  food_quality_rating INTEGER CHECK (food_quality_rating >= 1 AND food_quality_rating <= 5),
  service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
  cleanliness_rating INTEGER CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
  ambiance_rating INTEGER CHECK (ambiance_rating >= 1 AND ambiance_rating <= 5),
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
  overall_rating DECIMAL(2,1), -- Calculado automáticamente
  comment TEXT,
  visit_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, restaurant_id)
);

-- 10. CHEERS EN RESEÑAS
CREATE TABLE public.review_cheers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  review_id uuid REFERENCES public.restaurant_reviews(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, review_id)
);

-- 11. FAVORITOS/GUARDADOS (posts)
CREATE TABLE public.saved_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, post_id)
);

-- 12. FAVORITOS/GUARDADOS (recetas)
CREATE TABLE public.saved_recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  recipe_id uuid REFERENCES public.recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, recipe_id)
);

-- 13. FAVORITOS/GUARDADOS (restaurantes)
CREATE TABLE public.saved_restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, restaurant_id)
);

-- 14. SEGUIDORES/SEGUIDOS
CREATE TABLE public.user_followers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  followed_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (follower_id, followed_id),
  CHECK (follower_id != followed_id)
);

-- 15. CATEGORÍAS DE INTERESES
CREATE TABLE public.interest_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 16. INTERESES
CREATE TABLE public.interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.interest_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 17. INTERESES DEL USUARIO
CREATE TABLE public.user_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  interest_id uuid REFERENCES public.interests(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, interest_id)
);

-- 18. DENUNCIAS/REPORTES
CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  reported_user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  recipe_id uuid REFERENCES public.recipes(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES public.comments(id) ON DELETE CASCADE,
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE,
  review_id uuid REFERENCES public.restaurant_reviews(id) ON DELETE CASCADE,
  report_type TEXT CHECK (report_type IN ('spam', 'inappropriate_content', 'harassment', 'fake_info', 'copyright', 'other')),
  description TEXT,
  status TEXT CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')) DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  -- Al menos uno debe estar presente
  CHECK (
    reported_user_id IS NOT NULL OR 
    post_id IS NOT NULL OR 
    recipe_id IS NOT NULL OR 
    comment_id IS NOT NULL OR 
    restaurant_id IS NOT NULL OR 
    review_id IS NOT NULL
  )
);

-- 19. NOTIFICACIONES
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('follow', 'cheer', 'comment', 'review', 'mention', 'recipe_published', 'system')),
  title TEXT NOT NULL,
  message TEXT,
  data JSONB, -- Información adicional específica del tipo
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 20. LISTAS DE COMPRAS
CREATE TABLE public.shopping_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT DEFAULT 'Mi lista de compras',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 21. ITEMS DE LISTAS DE COMPRAS
CREATE TABLE public.shopping_list_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shopping_list_id uuid REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
  recipe_id uuid REFERENCES public.recipes(id) ON DELETE SET NULL,
  ingredient_name TEXT NOT NULL,
  quantity TEXT,
  unit TEXT,
  is_checked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ========================================
-- CONFIGURACIÓN DE SEGURIDAD (RLS)
-- ========================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cheers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_cheers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_cheers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interest_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;

-- Políticas básicas de usuarios
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Public profiles are viewable" ON public.users FOR SELECT USING (true);

-- Políticas para contenido público (recetas, posts)
CREATE POLICY "Public recipes are viewable" ON public.recipes FOR SELECT USING (is_public = true);
CREATE POLICY "Authors can manage their recipes" ON public.recipes FOR ALL USING (auth.uid() = author_id);

CREATE POLICY "Public posts are viewable" ON public.posts FOR SELECT USING (is_public = true);
CREATE POLICY "Authors can manage their posts" ON public.posts FOR ALL USING (auth.uid() = author_id);

-- Políticas para interacciones sociales
CREATE POLICY "Users can manage their own cheers" ON public.cheers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view all cheers" ON public.cheers FOR SELECT USING (true);

CREATE POLICY "Users can manage their own comments" ON public.comments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public comments are viewable" ON public.comments FOR SELECT USING (true);

-- Políticas para categorías e intereses (público para lectura)
CREATE POLICY "Anyone can view interest categories" ON public.interest_categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view interests" ON public.interests FOR SELECT USING (true);
CREATE POLICY "Users can manage their own interests" ON public.user_interests FOR ALL USING (auth.uid() = user_id);

-- Políticas para favoritos/guardados
CREATE POLICY "Users can manage their saved posts" ON public.saved_posts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their saved recipes" ON public.saved_recipes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their saved restaurants" ON public.saved_restaurants FOR ALL USING (auth.uid() = user_id);

-- Políticas para notificaciones
CREATE POLICY "Users can view their notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- ========================================
-- DATOS INICIALES
-- ========================================

-- Insertar categorías de intereses
INSERT INTO public.interest_categories (name, icon, description) VALUES
('Tipos de Cocina', 'ChefHat', 'Estilos culinarios y tradiciones gastronómicas'),
('Métodos de Cocción', 'Flame', 'Técnicas y formas de preparar alimentos'),
('Ingredientes', 'Apple', 'Ingredientes y productos favoritos'),
('Ocasiones', 'Calendar', 'Momentos y eventos para cocinar'),
('Salud y Bienestar', 'Heart', 'Opciones saludables y dietéticas');

-- Insertar intereses por categoría
INSERT INTO public.interests (category_id, name) VALUES
-- Tipos de Cocina
((SELECT id FROM public.interest_categories WHERE name = 'Tipos de Cocina'), 'Italiana'),
((SELECT id FROM public.interest_categories WHERE name = 'Tipos de Cocina'), 'Mexicana'),
((SELECT id FROM public.interest_categories WHERE name = 'Tipos de Cocina'), 'Asiática'),
((SELECT id FROM public.interest_categories WHERE name = 'Tipos de Cocina'), 'Mediterránea'),
((SELECT id FROM public.interest_categories WHERE name = 'Tipos de Cocina'), 'Colombiana'),
((SELECT id FROM public.interest_categories WHERE name = 'Tipos de Cocina'), 'Francesa'),
((SELECT id FROM public.interest_categories WHERE name = 'Tipos de Cocina'), 'Japonesa'),
((SELECT id FROM public.interest_categories WHERE name = 'Tipos de Cocina'), 'India'),
((SELECT id FROM public.interest_categories WHERE name = 'Tipos de Cocina'), 'Tailandesa'),
((SELECT id FROM public.interest_categories WHERE name = 'Tipos de Cocina'), 'Peruana'),

-- Métodos de Cocción
((SELECT id FROM public.interest_categories WHERE name = 'Métodos de Cocción'), 'Horneado'),
((SELECT id FROM public.interest_categories WHERE name = 'Métodos de Cocción'), 'Parrilla'),
((SELECT id FROM public.interest_categories WHERE name = 'Métodos de Cocción'), 'Fritura'),
((SELECT id FROM public.interest_categories WHERE name = 'Métodos de Cocción'), 'Vapor'),
((SELECT id FROM public.interest_categories WHERE name = 'Métodos de Cocción'), 'Salteado'),

-- Ingredientes
((SELECT id FROM public.interest_categories WHERE name = 'Ingredientes'), 'Mariscos'),
((SELECT id FROM public.interest_categories WHERE name = 'Ingredientes'), 'Carnes'),
((SELECT id FROM public.interest_categories WHERE name = 'Ingredientes'), 'Vegetales'),
((SELECT id FROM public.interest_categories WHERE name = 'Ingredientes'), 'Frutas'),
((SELECT id FROM public.interest_categories WHERE name = 'Ingredientes'), 'Especias'),

-- Ocasiones
((SELECT id FROM public.interest_categories WHERE name = 'Ocasiones'), 'Desayuno'),
((SELECT id FROM public.interest_categories WHERE name = 'Ocasiones'), 'Almuerzo'),
((SELECT id FROM public.interest_categories WHERE name = 'Ocasiones'), 'Cena'),
((SELECT id FROM public.interest_categories WHERE name = 'Ocasiones'), 'Postres'),
((SELECT id FROM public.interest_categories WHERE name = 'Ocasiones'), 'Snacks'),

-- Salud y Bienestar
((SELECT id FROM public.interest_categories WHERE name = 'Salud y Bienestar'), 'Vegano'),
((SELECT id FROM public.interest_categories WHERE name = 'Salud y Bienestar'), 'Vegetariano'),
((SELECT id FROM public.interest_categories WHERE name = 'Salud y Bienestar'), 'Sin gluten'),
((SELECT id FROM public.interest_categories WHERE name = 'Salud y Bienestar'), 'Keto'),
((SELECT id FROM public.interest_categories WHERE name = 'Salud y Bienestar'), 'Bajo en calorías');

-- ========================================
-- FUNCIONES Y TRIGGERS
-- ========================================

-- Función para calcular rating promedio de restaurantes
CREATE OR REPLACE FUNCTION calculate_restaurant_overall_rating()
RETURNS TRIGGER AS $$
BEGIN
  NEW.overall_rating = (
    (NEW.food_quality_rating * 0.3) +
    (NEW.service_rating * 0.25) +
    (NEW.cleanliness_rating * 0.15) +
    (NEW.ambiance_rating * 0.15) +
    (NEW.value_rating * 0.15)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_overall_rating_trigger
  BEFORE INSERT OR UPDATE ON public.restaurant_reviews
  FOR EACH ROW EXECUTE FUNCTION calculate_restaurant_overall_rating();

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a tablas relevantes
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON public.restaurants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON public.recipes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ========================================

-- Índices para usuarios
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_users_onboarding_completed ON public.users(onboarding_completed);

-- Índices para contenido
CREATE INDEX idx_recipes_author_id ON public.recipes(author_id);
CREATE INDEX idx_recipes_public ON public.recipes(is_public);
CREATE INDEX idx_posts_author_id ON public.posts(author_id);
CREATE INDEX idx_posts_public ON public.posts(is_public);

-- Índices para interacciones sociales
CREATE INDEX idx_cheers_user_id ON public.cheers(user_id);
CREATE INDEX idx_cheers_post_id ON public.cheers(post_id);
CREATE INDEX idx_cheers_recipe_id ON public.cheers(recipe_id);
CREATE INDEX idx_comments_post_id ON public.comments(post_id);
CREATE INDEX idx_comments_recipe_id ON public.comments(recipe_id);

-- Índices para favoritos
CREATE INDEX idx_saved_posts_user_id ON public.saved_posts(user_id);
CREATE INDEX idx_saved_recipes_user_id ON public.saved_recipes(user_id);
CREATE INDEX idx_saved_restaurants_user_id ON public.saved_restaurants(user_id);

-- Índices para seguidores
CREATE INDEX idx_user_followers_follower_id ON public.user_followers(follower_id);
CREATE INDEX idx_user_followers_followed_id ON public.user_followers(followed_id);

-- Índices para reseñas
CREATE INDEX idx_restaurant_reviews_restaurant_id ON public.restaurant_reviews(restaurant_id);
CREATE INDEX idx_restaurant_reviews_user_id ON public.restaurant_reviews(user_id);

-- Índices para búsquedas
CREATE INDEX idx_recipes_cuisine_type ON public.recipes(cuisine_type);
CREATE INDEX idx_recipes_difficulty ON public.recipes(difficulty);
CREATE INDEX idx_restaurants_cuisine_type ON public.restaurants(cuisine_type);
