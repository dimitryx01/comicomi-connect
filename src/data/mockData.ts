
// Mock data for the application

// Users
export const users = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'María García',
    username: 'chef_maria',
    email: 'chef.maria@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
    bio: 'Chef profesional apasionada por la cocina mediterránea 👩‍🍳',
    city: 'Madrid',
    country: 'España',
    followers: 2543,
    following: 187,
    joinDate: '2022-04-15'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Carlos Rodríguez',
    username: 'foodie_carlos',
    email: 'foodie.carlos@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    bio: 'Amante de la buena comida y explorador gastronómico 🍽️',
    city: 'Barcelona',
    country: 'España',
    followers: 1876,
    following: 342,
    joinDate: '2022-06-20'
  }
];

// Restaurants
export const restaurants = [
  {
    id: 'rest-1',
    name: 'La Pasta Perfetta',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
    cuisine: 'Italiana',
    rating: 4.5,
    reviewCount: 234,
    location: 'Centro, Madrid',
    priceRange: '€€€',
    description: 'Auténtica cocina italiana en el corazón de Madrid'
  },
  {
    id: 'rest-2',
    name: 'Sushi Zen',
    imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
    cuisine: 'Japonesa',
    rating: 4.7,
    reviewCount: 189,
    location: 'Salamanca, Madrid',
    priceRange: '€€€€',
    description: 'Experiencia gastronómica japonesa premium'
  }
];

// Posts
export const posts = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    user: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'María García',
      username: 'chef_maria',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face'
    },
    content: '¡Acabo de probar la nueva receta de tacos de pescado! Absolutamente deliciosos 🌮🐟',
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop',
    likes: 2,
    comments: 2,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    isLiked: false
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    user: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'María García',
      username: 'chef_maria',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face'
    },
    content: 'Visitando este increíble restaurante italiano en el centro. La pasta está perfecta! 🍝',
    imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&h=600&fit=crop',
    likes: 1,
    comments: 1,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    isLiked: false,
    restaurant: {
      id: 'rest-1',
      name: 'La Pasta Perfetta'
    }
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    user: {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Carlos Rodríguez',
      username: 'foodie_carlos',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    content: 'Cocinando en casa hoy. Nada como una buena comida casera para el alma ❤️',
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
    likes: 1,
    comments: 1,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    isLiked: false
  }
];

// Recipes
export const recipes = [
  {
    id: 'recipe-1',
    title: 'Paella Valenciana Tradicional',
    image: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=400&h=300&fit=crop',
    author: 'Chef María',
    cookTime: '45 min',
    difficulty: 'Intermedio',
    rating: 4.8,
    servings: 6
  },
  {
    id: 'recipe-2',
    title: 'Gazpacho Andaluz',
    image: 'https://images.unsplash.com/photo-1571197119282-7c4c6d0b2d2c?w=400&h=300&fit=crop',
    author: 'Carlos Rodríguez',
    cookTime: '15 min',
    difficulty: 'Fácil',
    rating: 4.6,
    servings: 4
  }
];
