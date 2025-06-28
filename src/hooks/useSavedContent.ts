
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface SavedPost {
  id: string;
  content: string;
  created_at: string;
  author?: {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string;
  };
  media_urls: any[];
  cheers_count: number;
  comments_count: number;
  saves_count: number;
  shares_count: number;
  has_user_cheered: boolean;
  has_user_saved: boolean;
  restaurant?: any;
  recipe?: any;
  is_shared?: boolean;
  shared_data?: any;
}

interface SavedRecipe {
  id: string;
  title: string;
  description: string;
  image_url: string;
  author: string;
  authorUsername: string;
  authorAvatar: string;
  authorId: string;
  prepTime: number;
  difficulty: string;
  rating: number;
  saves: number;
  cheersCount: number;
  hasVideo: boolean;
}

interface SavedRestaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  location: string;
  imageUrl: string;
  coverImageUrl: string;
  cuisineType: string;
  averageRating: number;
  reviewsCount: number;
  isVerified: boolean;
  phone: string;
  website: string;
}

export const useSavedContent = () => {
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [savedRestaurants, setSavedRestaurants] = useState<SavedRestaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchSavedPosts = useCallback(async () => {
    if (!user) {
      console.log('❌ useSavedContent: No hay usuario autenticado');
      return;
    }

    try {
      console.log('📡 useSavedContent: Obteniendo posts guardados para usuario:', user.id);

      const { data, error } = await supabase
        .from('saved_posts')
        .select(`
          post_id,
          created_at,
          posts (
            id,
            content,
            created_at,
            media_urls,
            author_id,
            is_shared,
            shared_data,
            location,
            restaurant_id,
            users!posts_author_id_fkey (
              id,
              full_name,
              username,
              avatar_url
            ),
            restaurants (
              id,
              name
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ useSavedContent: Error obteniendo posts guardados:', error);
        throw error;
      }

      console.log('✅ useSavedContent: Posts guardados obtenidos:', {
        count: data?.length || 0,
        data: data
      });

      const transformedPosts = (data || []).map((item: any) => {
        if (!item.posts) {
          console.warn('⚠️ useSavedContent: Post sin datos encontrado:', item);
          return null;
        }

        return {
          id: item.posts.id,
          content: item.posts.content || '',
          created_at: item.posts.created_at,
          author: {
            id: item.posts.users?.id || item.posts.author_id || '',
            full_name: item.posts.users?.full_name || 'Usuario',
            username: item.posts.users?.username || 'usuario',
            avatar_url: item.posts.users?.avatar_url || ''
          },
          media_urls: item.posts.media_urls || [],
          cheers_count: 0,
          comments_count: 0,
          saves_count: 0,
          shares_count: 0,
          has_user_cheered: false,
          has_user_saved: true,
          restaurant: item.posts.restaurants ? {
            id: item.posts.restaurants.id,
            name: item.posts.restaurants.name
          } : null,
          recipe: null,
          is_shared: item.posts.is_shared || false,
          shared_data: item.posts.shared_data || null,
          location: item.posts.location
        };
      }).filter(Boolean);

      console.log('✅ useSavedContent: Posts transformados:', {
        originalCount: data?.length || 0,
        transformedCount: transformedPosts.length,
        posts: transformedPosts
      });

      setSavedPosts(transformedPosts);
    } catch (error) {
      console.error('❌ useSavedContent: Error completo obteniendo posts guardados:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los posts guardados",
        variant: "destructive"
      });
    }
  }, [user, toast]);

  const fetchSavedRecipes = useCallback(async () => {
    if (!user) return;

    try {
      console.log('📡 useSavedContent: Obteniendo recetas guardadas para usuario:', user.id);

      const { data, error } = await supabase
        .from('saved_recipes')
        .select(`
          recipe_id,
          created_at,
          recipes (
            id,
            title,
            description,
            image_url,
            author_id,
            prep_time,
            cook_time,
            difficulty,
            youtube_url,
            users!recipes_author_id_fkey (
              id,
              full_name,
              username,
              avatar_url
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ useSavedContent: Error obteniendo recetas guardadas:', error);
        throw error;
      }

      console.log('✅ useSavedContent: Recetas guardadas obtenidas:', {
        count: data?.length || 0,
        data: data
      });

      const transformedRecipes = (data || []).map((item: any) => {
        if (!item.recipes) {
          console.warn('⚠️ useSavedContent: Receta sin datos encontrada:', item);
          return null;
        }

        return {
          id: item.recipes.id,
          title: item.recipes.title || '',
          description: item.recipes.description || '',
          image_url: item.recipes.image_url || '',
          author: item.recipes.users?.full_name || 'Usuario',
          authorUsername: item.recipes.users?.username || 'usuario',
          authorAvatar: item.recipes.users?.avatar_url || '',
          authorId: item.recipes.author_id || '',
          prepTime: (item.recipes.prep_time || 0) + (item.recipes.cook_time || 0),
          difficulty: item.recipes.difficulty || 'Medio',
          rating: 4.5,
          saves: 0,
          cheersCount: 0,
          hasVideo: !!item.recipes.youtube_url
        };
      }).filter(Boolean);

      console.log('✅ useSavedContent: Recetas transformadas:', {
        originalCount: data?.length || 0,
        transformedCount: transformedRecipes.length
      });

      setSavedRecipes(transformedRecipes);
    } catch (error) {
      console.error('❌ useSavedContent: Error completo obteniendo recetas guardadas:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las recetas guardadas",
        variant: "destructive"
      });
    }
  }, [user, toast]);

  const fetchSavedRestaurants = useCallback(async () => {
    if (!user) return;

    try {
      console.log('📡 useSavedContent: Obteniendo restaurantes guardados para usuario:', user.id);

      const { data, error } = await supabase
        .from('saved_restaurants')
        .select(`
          restaurant_id,
          created_at,
          restaurants (
            id,
            name,
            description,
            address,
            location,
            image_url,
            cover_image_url,
            cuisine_type,
            phone,
            website,
            is_verified
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ useSavedContent: Error obteniendo restaurantes guardados:', error);
        throw error;
      }

      console.log('✅ useSavedContent: Restaurantes guardados obtenidos:', {
        count: data?.length || 0,
        data: data
      });

      const transformedRestaurants = (data || []).map((item: any) => {
        if (!item.restaurants) {
          console.warn('⚠️ useSavedContent: Restaurante sin datos encontrado:', item);
          return null;
        }

        return {
          id: item.restaurants.id,
          name: item.restaurants.name || '',
          description: item.restaurants.description || '',
          address: item.restaurants.address || '',
          location: item.restaurants.location || '',
          imageUrl: item.restaurants.image_url || '',
          coverImageUrl: item.restaurants.cover_image_url || '',
          cuisineType: item.restaurants.cuisine_type || '',
          averageRating: 4.5,
          reviewsCount: 0,
          isVerified: item.restaurants.is_verified || false,
          phone: item.restaurants.phone || '',
          website: item.restaurants.website || ''
        };
      }).filter(Boolean);

      console.log('✅ useSavedContent: Restaurantes transformados:', {
        originalCount: data?.length || 0,
        transformedCount: transformedRestaurants.length
      });

      setSavedRestaurants(transformedRestaurants);
    } catch (error) {
      console.error('❌ useSavedContent: Error completo obteniendo restaurantes guardados:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los restaurantes guardados",
        variant: "destructive"
      });
    }
  }, [user, toast]);

  const fetchAllSavedContent = useCallback(async () => {
    if (!user) {
      console.log('❌ useSavedContent: No se puede obtener contenido sin usuario autenticado');
      return;
    }

    try {
      console.log('🔄 useSavedContent: Iniciando carga de todo el contenido guardado...');
      setLoading(true);
      
      await Promise.all([
        fetchSavedPosts(),
        fetchSavedRecipes(),
        fetchSavedRestaurants()
      ]);

      console.log('✅ useSavedContent: Todo el contenido guardado cargado exitosamente');
    } catch (error) {
      console.error('❌ useSavedContent: Error cargando contenido guardado:', error);
    } finally {
      setLoading(false);
    }
  }, [user, fetchSavedPosts, fetchSavedRecipes, fetchSavedRestaurants]);

  useEffect(() => {
    console.log('🔄 useSavedContent: useEffect triggered, usuario:', user?.id);
    if (user) {
      fetchAllSavedContent();
    } else {
      // Limpiar datos si no hay usuario
      setSavedPosts([]);
      setSavedRecipes([]);
      setSavedRestaurants([]);
    }
  }, [user, fetchAllSavedContent]);

  console.log('📊 useSavedContent: Estado actual:', {
    loading,
    postsCount: savedPosts.length,
    recipesCount: savedRecipes.length,
    restaurantsCount: savedRestaurants.length,
    hasUser: !!user
  });

  return {
    savedPosts,
    savedRecipes,
    savedRestaurants,
    loading,
    refetch: fetchAllSavedContent
  };
};
