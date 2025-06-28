
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
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('saved_posts')
        .select(`
          post_id,
          posts (
            id,
            content,
            created_at,
            media_urls,
            author_id,
            is_shared,
            shared_data,
            users!posts_author_id_fkey (
              id,
              full_name,
              username,
              avatar_url
            )
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const transformedPosts = (data || []).map((item: any) => ({
        id: item.posts.id,
        content: item.posts.content,
        created_at: item.posts.created_at,
        author: {
          id: item.posts.users?.id || '',
          full_name: item.posts.users?.full_name || 'Usuario',
          username: item.posts.users?.username || '',
          avatar_url: item.posts.users?.avatar_url || ''
        },
        media_urls: item.posts.media_urls || [],
        cheers_count: 0,
        comments_count: 0,
        saves_count: 0,
        shares_count: 0,
        has_user_cheered: false,
        has_user_saved: true,
        restaurant: null,
        recipe: null,
        is_shared: item.posts.is_shared || false,
        shared_data: item.posts.shared_data || null
      }));

      setSavedPosts(transformedPosts);
    } catch (error) {
      console.error('Error fetching saved posts:', error);
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
      const { data, error } = await supabase
        .from('saved_recipes')
        .select(`
          recipe_id,
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
        .eq('user_id', user.id);

      if (error) throw error;

      const transformedRecipes = (data || []).map((item: any) => ({
        id: item.recipes.id,
        title: item.recipes.title,
        description: item.recipes.description || '',
        image_url: item.recipes.image_url || '',
        author: item.recipes.users?.full_name || 'Usuario',
        authorUsername: item.recipes.users?.username || '',
        authorAvatar: item.recipes.users?.avatar_url || '',
        authorId: item.recipes.author_id || '',
        prepTime: (item.recipes.prep_time || 0) + (item.recipes.cook_time || 0),
        difficulty: item.recipes.difficulty || 'Medio',
        rating: 4.5,
        saves: 0,
        cheersCount: 0,
        hasVideo: !!item.recipes.youtube_url
      }));

      setSavedRecipes(transformedRecipes);
    } catch (error) {
      console.error('Error fetching saved recipes:', error);
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
      const { data, error } = await supabase
        .from('saved_restaurants')
        .select(`
          restaurant_id,
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
        .eq('user_id', user.id);

      if (error) throw error;

      const transformedRestaurants = (data || []).map((item: any) => ({
        id: item.restaurants.id,
        name: item.restaurants.name,
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
      }));

      setSavedRestaurants(transformedRestaurants);
    } catch (error) {
      console.error('Error fetching saved restaurants:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los restaurantes guardados",
        variant: "destructive"
      });
    }
  }, [user, toast]);

  const fetchAllSavedContent = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      await Promise.all([
        fetchSavedPosts(),
        fetchSavedRecipes(),
        fetchSavedRestaurants()
      ]);
    } finally {
      setLoading(false);
    }
  }, [user, fetchSavedPosts, fetchSavedRecipes, fetchSavedRestaurants]);

  useEffect(() => {
    fetchAllSavedContent();
  }, [fetchAllSavedContent]);

  return {
    savedPosts,
    savedRecipes,
    savedRestaurants,
    loading,
    refetch: fetchAllSavedContent
  };
};
