import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export const useRestaurantsWithoutAuth = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        console.log('🔍 useRestaurantsWithoutAuth: Obteniendo restaurantes públicos');
        
        const { data, error } = await supabase
          .from('restaurants')
          .select(`
            *,
            restaurant_reviews!left (
              overall_rating
            )
          `)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;

        // Procesar los datos para calcular ratings y conteos
        const processedRestaurants: Restaurant[] = (data || []).map((restaurant: any) => {
          const reviews = restaurant.restaurant_reviews || [];
          const validRatings = reviews
            .map((review: any) => review.overall_rating)
            .filter((rating: number) => rating != null && !isNaN(rating));
          
          const average_rating = validRatings.length > 0 
            ? validRatings.reduce((sum: number, rating: number) => sum + rating, 0) / validRatings.length
            : 0;

          // Remover los datos joined del objeto final
          const { restaurant_reviews, ...restaurantData } = restaurant;

          return {
            ...restaurantData,
            average_rating: Math.round(average_rating * 10) / 10,
            reviews_count: reviews.length
          };
        });

        setRestaurants(processedRestaurants);
        console.log('✅ useRestaurantsWithoutAuth: Restaurantes obtenidos:', processedRestaurants.length);
      } catch (err) {
        console.error('❌ useRestaurantsWithoutAuth: Error obteniendo restaurantes:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  return {
    restaurants,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      setError(null);
    }
  };
};