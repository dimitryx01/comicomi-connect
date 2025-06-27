
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Restaurant {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  cover_image_url?: string;
  cuisine_type?: string;
  address?: string;
  location?: string;
  phone?: string;
  email?: string;
  website?: string;
  owner_id?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  average_rating: number;
  reviews_count: number;
}

interface UseRestaurantsOptions {
  cuisine_type?: string;
  location?: string;
  min_rating?: number;
  order_by?: 'name' | 'created_at' | 'average_rating' | 'reviews_count';
  order_direction?: 'asc' | 'desc';
  limit?: number;
}

export const useRestaurants = (options: UseRestaurantsOptions = {}) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    cuisine_type,
    location,
    min_rating,
    order_by = 'created_at',
    order_direction = 'desc',
    limit = 20
  } = options;

  const fetchRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build the query with joins to get average ratings and review counts
      let query = supabase
        .from('restaurants')
        .select(`
          *,
          restaurant_reviews!left (
            overall_rating
          )
        `);

      // Apply filters
      if (cuisine_type) {
        query = query.eq('cuisine_type', cuisine_type);
      }

      if (location) {
        query = query.ilike('location', `%${location}%`);
      }

      // Order and limit
      query = query
        .order(order_by, { ascending: order_direction === 'asc' })
        .limit(limit);

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      // Process the data to calculate average ratings and review counts
      const processedRestaurants: Restaurant[] = (data || []).map((restaurant: any) => {
        const reviews = restaurant.restaurant_reviews || [];
        const validRatings = reviews
          .map((review: any) => review.overall_rating)
          .filter((rating: number) => rating != null && !isNaN(rating));
        
        const average_rating = validRatings.length > 0 
          ? validRatings.reduce((sum: number, rating: number) => sum + rating, 0) / validRatings.length
          : 0;

        return {
          ...restaurant,
          average_rating: Math.round(average_rating * 10) / 10, // Round to 1 decimal
          reviews_count: reviews.length,
          restaurant_reviews: undefined // Remove the joined data from final object
        };
      });

      // Apply rating filter after processing (since we can't filter on computed fields in the query)
      const filteredRestaurants = min_rating 
        ? processedRestaurants.filter(r => r.average_rating >= min_rating)
        : processedRestaurants;

      setRestaurants(filteredRestaurants);
    } catch (err) {
      console.error('Error fetching restaurants:', err);
      setError(err instanceof Error ? err.message : 'Error fetching restaurants');
      toast({
        title: "Error",
        description: "No se pudieron cargar los restaurantes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [cuisine_type, location, min_rating, order_by, order_direction, limit, toast]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  const refreshRestaurants = useCallback(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  return {
    restaurants,
    loading,
    error,
    refreshRestaurants
  };
};

export const useRestaurant = (restaurantId: string) => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRestaurant = useCallback(async () => {
    if (!restaurantId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('restaurants')
        .select(`
          *,
          restaurant_reviews!left (
            overall_rating
          )
        `)
        .eq('id', restaurantId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      if (data) {
        const reviews = data.restaurant_reviews || [];
        const validRatings = reviews
          .map((review: any) => review.overall_rating)
          .filter((rating: number) => rating != null && !isNaN(rating));
        
        const average_rating = validRatings.length > 0 
          ? validRatings.reduce((sum: number, rating: number) => sum + rating, 0) / validRatings.length
          : 0;

        setRestaurant({
          ...data,
          average_rating: Math.round(average_rating * 10) / 10,
          reviews_count: reviews.length,
          restaurant_reviews: undefined
        });
      }
    } catch (err) {
      console.error('Error fetching restaurant:', err);
      setError(err instanceof Error ? err.message : 'Error fetching restaurant');
      toast({
        title: "Error",
        description: "No se pudo cargar el restaurante",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [restaurantId, toast]);

  useEffect(() => {
    fetchRestaurant();
  }, [fetchRestaurant]);

  const refreshRestaurant = useCallback(() => {
    fetchRestaurant();
  }, [fetchRestaurant]);

  return {
    restaurant,
    loading,
    error,
    refreshRestaurant
  };
};
