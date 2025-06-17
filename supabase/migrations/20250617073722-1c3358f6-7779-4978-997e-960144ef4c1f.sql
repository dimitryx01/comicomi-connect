
-- Limpiar datos existentes para empezar fresco
DELETE FROM public.comment_cheers;
DELETE FROM public.review_cheers;
DELETE FROM public.cheers;
DELETE FROM public.comments;
DELETE FROM public.saved_posts;
DELETE FROM public.saved_recipes;
DELETE FROM public.saved_restaurants;
DELETE FROM public.user_followers;
DELETE FROM public.user_interests;
DELETE FROM public.restaurant_reviews;
DELETE FROM public.posts;
DELETE FROM public.recipes;
DELETE FROM public.restaurants;
DELETE FROM public.users;

-- Insertar perfiles de usuario usando los IDs reales de auth.users
INSERT INTO public.users (
  id, email, full_name, username, avatar_url, bio, location, 
  cooking_level, dietary_restrictions, favorite_cuisines, 
  onboarding_completed, first_name, last_name, city, country
) VALUES
-- Usuario 1 - Jorge
('c50435d9-7bd7-4d79-af16-0ef8d63261d0', 'jolmangordillo@gmail.com', 'Jorge Olmán', 'jolman_chef', 
 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', 
 '👨‍🍳 Cocinero apasionado experimentando con sabores tradicionales y modernos. Siempre aprendiendo algo nuevo en la cocina.', 
 'Madrid, España', 'intermediate', ARRAY[]::text[], ARRAY['Española', 'Mediterránea']::text[], 
 true, 'Jorge', 'Olmán', 'Madrid', 'España'),

-- Usuario 2 - Álvaro  
('a8a87ef3-932e-4459-aa47-2831db3c95af', 'alvaroalonso.24@hotmail.com', 'Álvaro Alonso', 'alvaro_foodie', 
 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', 
 '🍴 Food enthusiast y explorador culinario. Me encanta descubrir nuevos restaurantes y compartir experiencias gastronómicas.', 
 'Barcelona, España', 'beginner', ARRAY[]::text[], ARRAY['Italiana', 'Asiática']::text[], 
 true, 'Álvaro', 'Alonso', 'Barcelona', 'España'),

-- Usuario 3 - Maya
('cb737f30-33b1-40c7-bf13-133949e0f2d4', 'maycifu05@gmail.com', 'Maya Cifuentes', 'maya_cook', 
 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', 
 '🌟 Estudiante de gastronomía con pasión por la repostería. Siempre experimentando con nuevas recetas dulces.', 
 'Valencia, España', 'advanced', ARRAY[]::text[], ARRAY['Francesa', 'Repostería']::text[], 
 true, 'Maya', 'Cifuentes', 'Valencia', 'España');

-- Insertar restaurantes ficticios
INSERT INTO public.restaurants (
  id, name, description, location, address, phone, email, website, 
  cuisine_type, image_url, cover_image_url, is_verified
) VALUES
('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'La Taberna del Chef', 
 'Restaurante tradicional español con toques modernos', 
 'Madrid, España', 'Calle Mayor 15, Madrid', '+34 911 234 567', 
 'info@latabernadel chef.es', 'www.latabernadel chef.es', 'Española',
 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=400&fit=crop', true),

('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'Nonna Isabella', 
 'Auténtica cocina italiana en el corazón de Barcelona', 
 'Barcelona, España', 'Carrer de Muntaner 45, Barcelona', '+34 933 456 789', 
 'ciao@nonnaisabella.es', 'www.nonnaisabella.es', 'Italiana',
 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=400&fit=crop', true),

('6ba7b811-9dad-11d1-80b4-00c04fd430c8', 'Sakura Sushi', 
 'Experiencia gastronómica japonesa auténtica', 
 'Valencia, España', 'Avenida del Puerto 22, Valencia', '+34 963 789 012', 
 'info@sakurasushi.es', 'www.sakurasushi.es', 'Japonesa',
 'https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=400&h=300&fit=crop',
 'https://images.unsplash.com/photo-1555992336-03a23c7b20ee?w=800&h=400&fit=crop', true);

-- Insertar recetas ficticias con UUIDs válidos
INSERT INTO public.recipes (
  id, author_id, title, description, image_url, prep_time, cook_time, 
  difficulty, cuisine_type, servings, ingredients, steps
) VALUES
('f47ac10b-58cc-4372-a567-0e02b2c3d470', 'c50435d9-7bd7-4d79-af16-0ef8d63261d0',
 'Paella Madrileña Casera', 
 'Mi versión personal de la paella, perfecta para domingos en familia',
 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=400&h=300&fit=crop',
 20, 40, 'media', 'Española', 6,
 '[{"name": "Arroz bomba", "quantity": "400", "unit": "g"}, {"name": "Pollo", "quantity": "1", "unit": "kg"}, {"name": "Conejo", "quantity": "500", "unit": "g"}, {"name": "Judías verdes", "quantity": "200", "unit": "g"}, {"name": "Garrofón", "quantity": "100", "unit": "g"}, {"name": "Azafrán", "quantity": "0.5", "unit": "g"}]'::jsonb,
 '[{"step": 1, "description": "Calentar aceite en la paellera y dorar el pollo y conejo"}, {"step": 2, "description": "Añadir las verduras y sofreír 5 minutos"}, {"step": 3, "description": "Incorporar el tomate rallado y el pimentón"}, {"step": 4, "description": "Agregar el arroz y el caldo con azafrán"}, {"step": 5, "description": "Cocer 20 minutos sin remover"}]'::jsonb),

('f47ac10b-58cc-4372-a567-0e02b2c3d471', 'cb737f30-33b1-40c7-bf13-133949e0f2d4',
 'Tarta de Tres Chocolates', 
 'Una deliciosa tarta que combina tres tipos de chocolate en capas perfectas',
 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
 30, 45, 'difícil', 'Francesa', 8,
 '[{"name": "Chocolate negro", "quantity": "200", "unit": "g"}, {"name": "Chocolate con leche", "quantity": "150", "unit": "g"}, {"name": "Chocolate blanco", "quantity": "100", "unit": "g"}, {"name": "Mantequilla", "quantity": "150", "unit": "g"}, {"name": "Huevos", "quantity": "4", "unit": "unidades"}, {"name": "Azúcar", "quantity": "100", "unit": "g"}, {"name": "Harina", "quantity": "50", "unit": "g"}]'::jsonb,
 '[{"step": 1, "description": "Derretir cada chocolate por separado al baño maría"}, {"step": 2, "description": "Batir huevos con azúcar hasta blanquear"}, {"step": 3, "description": "Crear tres capas: chocolate negro, con leche y blanco"}, {"step": 4, "description": "Hornear 35 minutos a 180°C"}, {"step": 5, "description": "Dejar enfriar y decorar al gusto"}]'::jsonb),

('f47ac10b-58cc-4372-a567-0e02b2c3d472', 'a8a87ef3-932e-4459-aa47-2831db3c95af',
 'Pasta Carbonara Auténtica', 
 'La receta tradicional italiana que aprendí en mi viaje a Roma',
 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop',
 10, 15, 'fácil', 'Italiana', 4,
 '[{"name": "Espaguetis", "quantity": "400", "unit": "g"}, {"name": "Guanciale", "quantity": "150", "unit": "g"}, {"name": "Huevos", "quantity": "4", "unit": "unidades"}, {"name": "Pecorino Romano", "quantity": "100", "unit": "g"}, {"name": "Pimienta negra", "quantity": "1", "unit": "cucharadita"}]'::jsonb,
 '[{"step": 1, "description": "Hervir agua con sal para la pasta"}, {"step": 2, "description": "Cortar guanciale en dados y sofreír hasta dorar"}, {"step": 3, "description": "Batir huevos con queso rallado y pimienta"}, {"step": 4, "description": "Mezclar pasta caliente con guanciale y huevos"}, {"step": 5, "description": "Servir inmediatamente con queso extra"}]'::jsonb),

('f47ac10b-58cc-4372-a567-0e02b2c3d473', 'c50435d9-7bd7-4d79-af16-0ef8d63261d0',
 'Gazpacho Andaluz Refrescante', 
 'Perfecto para los días de calor, receta familiar que nunca falla',
 'https://images.unsplash.com/photo-1571197731998-8158113bdb86?w=400&h=300&fit=crop',
 15, 0, 'fácil', 'Española', 4,
 '[{"name": "Tomates maduros", "quantity": "1", "unit": "kg"}, {"name": "Pepino", "quantity": "1", "unit": "unidad"}, {"name": "Pimiento verde", "quantity": "1", "unit": "unidad"}, {"name": "Cebolla", "quantity": "1/2", "unit": "unidad"}, {"name": "Ajo", "quantity": "2", "unit": "dientes"}, {"name": "Pan duro", "quantity": "100", "unit": "g"}, {"name": "Aceite de oliva", "quantity": "4", "unit": "cucharadas"}, {"name": "Vinagre de Jerez", "quantity": "2", "unit": "cucharadas"}]'::jsonb,
 '[{"step": 1, "description": "Escaldar tomates y pelar"}, {"step": 2, "description": "Cortar todas las verduras en trozos"}, {"step": 3, "description": "Remojar pan en agua"}, {"step": 4, "description": "Triturar todo junto hasta conseguir textura lisa"}, {"step": 5, "description": "Refrigerar mínimo 2 horas antes de servir"}]'::jsonb),

('f47ac10b-58cc-4372-a567-0e02b2c3d474', 'cb737f30-33b1-40c7-bf13-133949e0f2d4',
 'Macarons de Vainilla', 
 'Delicados macarons franceses, mi especialidad en repostería',
 'https://images.unsplash.com/photo-1571506165871-ee72a35bc9d4?w=400&h=300&fit=crop',
 60, 15, 'difícil', 'Francesa', 20,
 '[{"name": "Harina de almendra", "quantity": "100", "unit": "g"}, {"name": "Azúcar glas", "quantity": "200", "unit": "g"}, {"name": "Claras de huevo", "quantity": "75", "unit": "ml"}, {"name": "Azúcar", "quantity": "25", "unit": "g"}, {"name": "Esencia de vainilla", "quantity": "1", "unit": "cucharadita"}, {"name": "Colorante alimentario", "quantity": "3", "unit": "gotas"}]'::jsonb,
 '[{"step": 1, "description": "Tamizar harina de almendra y azúcar glas"}, {"step": 2, "description": "Montar claras a punto de nieve y añadir azúcar gradualmente"}, {"step": 3, "description": "Incorporar macaronage hasta conseguir textura adecuada"}, {"step": 4, "description": "Formar círculos en bandeja con manga pastelera"}, {"step": 5, "description": "Reposar 30 min y hornear 15 min a 150°C"}]'::jsonb);

-- Insertar publicaciones ficticias
INSERT INTO public.posts (
  id, author_id, content, post_type, media_urls, location, restaurant_id, recipe_id, created_at
) VALUES
('f47ac10b-58cc-4372-a567-0e02b2c3d475', 'c50435d9-7bd7-4d79-af16-0ef8d63261d0',
 'Domingo de paella en casa! 🥘 Después de varios intentos, creo que por fin tengo la receta perfecta. El secreto está en el sofrito y en no tocar el arroz durante la cocción. ¿Qué os parece el resultado?',
 'food_photo', 
 '[{"type": "image", "url": "https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=600&h=400&fit=crop"}]'::jsonb,
 'Madrid', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'f47ac10b-58cc-4372-a567-0e02b2c3d470',
 now() - interval '3 hours'),

('f47ac10b-58cc-4372-a567-0e02b2c3d476', 'a8a87ef3-932e-4459-aa47-2831db3c95af',
 'Increíble experiencia en @nonnaisabella anoche! 🍝 La carbonara estaba espectacular, exactamente como la que probé en Roma. El servicio impecable y el ambiente muy auténtico. Totalmente recomendado para los amantes de la verdadera cocina italiana!',
 'experience', 
 '[{"type": "image", "url": "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=600&h=400&fit=crop"}]'::jsonb,
 'Barcelona', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', null,
 now() - interval '6 hours'),

('f47ac10b-58cc-4372-a567-0e02b2c3d477', 'cb737f30-33b1-40c7-bf13-133949e0f2d4',
 'Practicando mis macarons! 🥐 Estos son de vainilla con un toque de color rosa. Después de muchos intentos fallidos, por fin estoy consiguiendo esa textura perfecta. La clave está en el macaronage y en el tiempo de reposo. ¿Algún consejo más de reposteros expertos?',
 'food_photo', 
 '[{"type": "image", "url": "https://images.unsplash.com/photo-1571506165871-ee72a35bc9d4?w=600&h=400&fit=crop"}]'::jsonb,
 'Valencia', null, 'f47ac10b-58cc-4372-a567-0e02b2c3d474',
 now() - interval '8 hours'),

('f47ac10b-58cc-4372-a567-0e02b2c3d478', 'c50435d9-7bd7-4d79-af16-0ef8d63261d0',
 'Primer gazpacho de la temporada! 🍅 Con este calor que hace en Madrid, no hay nada mejor que un gazpacho bien fresquito. Esta es la receta de mi abuela andaluza, simple pero deliciosa.',
 'food_photo', 
 '[{"type": "image", "url": "https://images.unsplash.com/photo-1571197731998-8158113bdb86?w=600&h=400&fit=crop"}]'::jsonb,
 'Madrid', null, 'f47ac10b-58cc-4372-a567-0e02b2c3d473',
 now() - interval '1 day');

-- Insertar relaciones de seguidores
INSERT INTO public.user_followers (follower_id, followed_id) VALUES
('a8a87ef3-932e-4459-aa47-2831db3c95af', 'c50435d9-7bd7-4d79-af16-0ef8d63261d0'), -- Álvaro sigue a Jorge
('cb737f30-33b1-40c7-bf13-133949e0f2d4', 'c50435d9-7bd7-4d79-af16-0ef8d63261d0'), -- Maya sigue a Jorge  
('c50435d9-7bd7-4d79-af16-0ef8d63261d0', 'cb737f30-33b1-40c7-bf13-133949e0f2d4'), -- Jorge sigue a Maya
('a8a87ef3-932e-4459-aa47-2831db3c95af', 'cb737f30-33b1-40c7-bf13-133949e0f2d4'), -- Álvaro sigue a Maya
('cb737f30-33b1-40c7-bf13-133949e0f2d4', 'a8a87ef3-932e-4459-aa47-2831db3c95af'); -- Maya sigue a Álvaro

-- Insertar cheers en publicaciones
INSERT INTO public.cheers (user_id, post_id) VALUES
('a8a87ef3-932e-4459-aa47-2831db3c95af', 'f47ac10b-58cc-4372-a567-0e02b2c3d475'), -- Álvaro da cheer a post de Jorge
('cb737f30-33b1-40c7-bf13-133949e0f2d4', 'f47ac10b-58cc-4372-a567-0e02b2c3d475'), -- Maya da cheer a post de Jorge
('c50435d9-7bd7-4d79-af16-0ef8d63261d0', 'f47ac10b-58cc-4372-a567-0e02b2c3d476'), -- Jorge da cheer a post de Álvaro
('cb737f30-33b1-40c7-bf13-133949e0f2d4', 'f47ac10b-58cc-4372-a567-0e02b2c3d476'), -- Maya da cheer a post de Álvaro
('c50435d9-7bd7-4d79-af16-0ef8d63261d0', 'f47ac10b-58cc-4372-a567-0e02b2c3d477'), -- Jorge da cheer a post de Maya
('a8a87ef3-932e-4459-aa47-2831db3c95af', 'f47ac10b-58cc-4372-a567-0e02b2c3d477'); -- Álvaro da cheer a post de Maya

-- Insertar comentarios en publicaciones
INSERT INTO public.comments (user_id, post_id, content) VALUES
('a8a87ef3-932e-4459-aa47-2831db3c95af', 'f47ac10b-58cc-4372-a567-0e02b2c3d475', 'Se ve increíble Jorge! Me das la receta del sofrito? 🙏'),
('cb737f30-33b1-40c7-bf13-133949e0f2d4', 'f47ac10b-58cc-4372-a567-0e02b2c3d475', 'Qué maravilla! Mi abuela hace paella pero nunca me ha salido igual'),
('c50435d9-7bd7-4d79-af16-0ef8d63261d0', 'f47ac10b-58cc-4372-a567-0e02b2c3d476', 'Nonna Isabella es increíble! Fui la semana pasada y quedé enamorado'),
('cb737f30-33b1-40c7-bf13-133949e0f2d4', 'f47ac10b-58cc-4372-a567-0e02b2c3d476', 'Apuntado para mi próxima visita a Barcelona! 📝'),
('c50435d9-7bd7-4d79-af16-0ef8d63261d0', 'f47ac10b-58cc-4372-a567-0e02b2c3d477', 'Están perfectos Maya! El color es precioso 💕'),
('a8a87ef3-932e-4459-aa47-2831db3c95af', 'f47ac10b-58cc-4372-a567-0e02b2c3d477', 'Impresionante técnica! Yo sería incapaz de hacer algo así');

-- Insertar cheers en recetas
INSERT INTO public.cheers (user_id, recipe_id) VALUES
('a8a87ef3-932e-4459-aa47-2831db3c95af', 'f47ac10b-58cc-4372-a567-0e02b2c3d470'), -- Álvaro da cheer a receta de paella de Jorge
('cb737f30-33b1-40c7-bf13-133949e0f2d4', 'f47ac10b-58cc-4372-a567-0e02b2c3d470'), -- Maya da cheer a receta de paella
('c50435d9-7bd7-4d79-af16-0ef8d63261d0', 'f47ac10b-58cc-4372-a567-0e02b2c3d471'), -- Jorge da cheer a tarta de Maya
('a8a87ef3-932e-4459-aa47-2831db3c95af', 'f47ac10b-58cc-4372-a567-0e02b2c3d471'), -- Álvaro da cheer a tarta de Maya
('c50435d9-7bd7-4d79-af16-0ef8d63261d0', 'f47ac10b-58cc-4372-a567-0e02b2c3d472'), -- Jorge da cheer a carbonara de Álvaro
('cb737f30-33b1-40c7-bf13-133949e0f2d4', 'f47ac10b-58cc-4372-a567-0e02b2c3d472'); -- Maya da cheer a carbonara

-- Insertar posts/recetas guardados
INSERT INTO public.saved_posts (user_id, post_id) VALUES
('a8a87ef3-932e-4459-aa47-2831db3c95af', 'f47ac10b-58cc-4372-a567-0e02b2c3d475'), -- Álvaro guarda post de paella de Jorge
('cb737f30-33b1-40c7-bf13-133949e0f2d4', 'f47ac10b-58cc-4372-a567-0e02b2c3d476'); -- Maya guarda post de restaurante de Álvaro

INSERT INTO public.saved_recipes (user_id, recipe_id) VALUES
('a8a87ef3-932e-4459-aa47-2831db3c95af', 'f47ac10b-58cc-4372-a567-0e02b2c3d470'), -- Álvaro guarda receta de paella
('cb737f30-33b1-40c7-bf13-133949e0f2d4', 'f47ac10b-58cc-4372-a567-0e02b2c3d472'), -- Maya guarda carbonara de Álvaro
('c50435d9-7bd7-4d79-af16-0ef8d63261d0', 'f47ac10b-58cc-4372-a567-0e02b2c3d471'); -- Jorge guarda tarta de Maya

-- Insertar reseñas de restaurantes
INSERT INTO public.restaurant_reviews (
  user_id, restaurant_id, food_quality_rating, service_rating, 
  cleanliness_rating, ambiance_rating, value_rating, comment, visit_date
) VALUES
('a8a87ef3-932e-4459-aa47-2831db3c95af', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', 
 5, 5, 5, 4, 4, 'Experiencia italiana auténtica. La carbonara estaba perfecta, exactamente como en Roma.', '2024-06-16'),
('c50435d9-7bd7-4d79-af16-0ef8d63261d0', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 
 5, 4, 5, 5, 4, 'Cocina tradicional española de calidad. Ambiente familiar y acogedor.', '2024-06-15'),
('cb737f30-33b1-40c7-bf13-133949e0f2d4', '6ba7b811-9dad-11d1-80b4-00c04fd430c8', 
 5, 5, 5, 5, 3, 'Sushi de altísima calidad. Cada pieza es una obra de arte culinaria.', '2024-06-14');

-- Insertar notificaciones
INSERT INTO public.notifications (
  user_id, type, title, message, data, is_read
) VALUES
('c50435d9-7bd7-4d79-af16-0ef8d63261d0', 'follow', 'Nuevo seguidor', 'Álvaro Alonso ha comenzado a seguirte', 
 '{"follower_id": "a8a87ef3-932e-4459-aa47-2831db3c95af", "follower_name": "Álvaro Alonso"}'::jsonb, false),
('c50435d9-7bd7-4d79-af16-0ef8d63261d0', 'cheer', 'Nueva reacción', 'Maya Cifuentes le dio cheer a tu publicación', 
 '{"post_id": "f47ac10b-58cc-4372-a567-0e02b2c3d475", "user_name": "Maya Cifuentes"}'::jsonb, false),
('a8a87ef3-932e-4459-aa47-2831db3c95af', 'comment', 'Nuevo comentario', 'Jorge Olmán comentó tu publicación', 
 '{"post_id": "f47ac10b-58cc-4372-a567-0e02b2c3d476", "user_name": "Jorge Olmán", "comment": "Nonna Isabella es increíble!"}'::jsonb, false);
