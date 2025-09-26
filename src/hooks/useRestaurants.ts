
import { useState, useEffect, useCallback, useMemo } from 'react';
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
  street_address?: string;
  postal_code?: string;
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

  // Memoize options to prevent unnecessary re-renders
  const memoizedOptions = useMemo(() => ({
    cuisine_type: options.cuisine_type,
    location: options.location,
    min_rating: options.min_rating,
    order_by: options.order_by || 'created_at',
    order_direction: options.order_direction || 'desc',
    limit: options.limit || 20
  }), [
    options.cuisine_type,
    options.location,
    options.min_rating,
    options.order_by,
    options.order_direction,
    options.limit
  ]);

  // Debounce state to prevent rapid-fire requests
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);
  const [requestCount, setRequestCount] = useState(0);
  const [lastRequestTime, setLastRequestTime] = useState(0);

  const fetchRestaurants = useCallback(async () => {
    const now = Date.now();
    
    // Circuit breaker: prevent too many requests in short time
    if (now - lastRequestTime < 1000) { // Minimum 1 second between requests
      console.log('[useRestaurants] Request rate limited');
      return;
    }
    
    if (requestCount > 10) { // Max 10 requests per session
      console.error('[useRestaurants] Too many requests, circuit breaker activated');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setRequestCount(prev => prev + 1);
      setLastRequestTime(now);

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
      if (memoizedOptions.cuisine_type) {
        query = query.eq('cuisine_type', memoizedOptions.cuisine_type);
      }

      if (memoizedOptions.location) {
        query = query.ilike('location', `%${memoizedOptions.location}%`);
      }

      // Order and limit
      query = query
        .order(memoizedOptions.order_by, { ascending: memoizedOptions.order_direction === 'asc' })
        .limit(memoizedOptions.limit);

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

        // Remove the joined data from final object
        const { restaurant_reviews, ...restaurantData } = restaurant;

        return {
          ...restaurantData,
          average_rating: Math.round(average_rating * 10) / 10, // Round to 1 decimal
          reviews_count: reviews.length
        };
      });

      // Apply rating filter after processing (since we can't filter on computed fields in the query)
      const filteredRestaurants = memoizedOptions.min_rating 
        ? processedRestaurants.filter(r => r.average_rating >= memoizedOptions.min_rating!)
        : processedRestaurants;

      setRestaurants(filteredRestaurants);
    } catch (err) {
      console.error('Error fetching restaurants:', err);
      setError(err instanceof Error ? err.message : 'Error fetching restaurants');
      // Remove toast dependency to prevent circular re-renders
      console.error("No se pudieron cargar los restaurantes");
    } finally {
      setLoading(false);
    }
  }, [memoizedOptions]); // Removed toast dependency

  useEffect(() => {
    let mounted = true;
    
    // Clear previous timeout
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    
    // Debounce the request to prevent rapid-fire calls
    const timeout = setTimeout(() => {
      if (mounted) {
        fetchRestaurants();
      }
    }, 300); // 300ms debounce
    
    setDebounceTimeout(timeout);
    
    return () => {
      mounted = false;
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [fetchRestaurants]); // Keep fetchRestaurants dependency but with circuit breaker

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

        // Remove the joined data from final object
        const { restaurant_reviews, ...restaurantData } = data;

        setRestaurant({
          ...restaurantData,
          average_rating: Math.round(average_rating * 10) / 10,
          reviews_count: reviews.length
        });
      }
    } catch (err) {
      console.error('Error fetching restaurant:', err);
      setError(err instanceof Error ? err.message : 'Error fetching restaurant');
      // Remove toast dependency to prevent re-renders
      console.error("No se pudo cargar el restaurante");
    } finally {
      setLoading(false);
    }
  }, [restaurantId]); // Removed toast dependency

  useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      if (mounted) {
        await fetchRestaurant();
      }
    };
    
    loadData();
    
    return () => {
      mounted = false;
    };
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
