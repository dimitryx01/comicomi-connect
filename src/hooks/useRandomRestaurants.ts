
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface RandomRestaurant {
  id: string;
  name: string;
  description: string;
  image_url: string;
  cover_image_url: string;
  location: string;
  cuisine_type: string;
  followers_count: number;
}

export const useRandomRestaurants = () => {
  const [restaurants, setRestaurants] = useState<RandomRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchRandomRestaurants = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Obtener la ciudad del usuario
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('city')
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error('Error fetching user city:', userError);
        setLoading(false);
        return;
      }

      const userCity = userData?.city || 'Madrid'; // Default a Madrid si no hay ciudad

      console.log('🏙️ useRandomRestaurants: Fetching restaurants for city:', userCity);

      // Obtener restaurantes aleatorios de la ciudad
      const { data, error } = await supabase
        .rpc('get_random_restaurants_by_city', {
          user_city: userCity,
          limit_count: 6
        });

      if (error) {
        console.error('Error fetching random restaurants:', error);
        return;
      }

      console.log('🏪 useRandomRestaurants: Found restaurants:', data?.length || 0);
      setRestaurants(data || []);
    } catch (error) {
      console.error('Error in fetchRandomRestaurants:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRandomRestaurants();
  }, [fetchRandomRestaurants]);

  return {
    restaurants,
    loading,
    refetch: fetchRandomRestaurants
  };
};
