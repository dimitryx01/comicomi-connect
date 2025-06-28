
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
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchRandomRestaurants = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔍 useRandomRestaurants: Fetching user data for:', user.id);

      // Obtener la ciudad del usuario
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('city, location, country')
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error('❌ useRandomRestaurants: Error fetching user data:', userError);
        setError('Error al obtener datos del usuario');
        setLoading(false);
        return;
      }

      console.log('👤 useRandomRestaurants: User data:', userData);

      // Determinar la ciudad a usar para la búsqueda
      let searchCity = userData?.city || '';
      
      // Si no hay ciudad específica, usar la ubicación completa o país
      if (!searchCity && userData?.location) {
        searchCity = userData.location;
      } else if (!searchCity && userData?.country) {
        searchCity = userData.country;
      }

      // Si aún no hay ciudad definida, usar 'Madrid' como fallback
      if (!searchCity) {
        searchCity = 'Madrid';
        console.log('⚠️ useRandomRestaurants: No city found for user, using default: Madrid');
      }

      console.log('🏙️ useRandomRestaurants: Using search city:', searchCity);

      // Obtener restaurantes de la ciudad
      const { data: cityRestaurants, error: cityError } = await supabase
        .rpc('get_random_restaurants_by_city', {
          user_city: searchCity,
          limit_count: 6
        });

      console.log('🏪 useRandomRestaurants: City restaurants result:', {
        searchCity,
        count: cityRestaurants?.length || 0,
        error: cityError
      });

      // Si hay error o no hay restaurantes en la ciudad específica, 
      // intentar obtener restaurantes aleatorios sin filtro de ciudad
      if (cityError || !cityRestaurants || cityRestaurants.length === 0) {
        console.log('🔄 useRandomRestaurants: Fallback to random restaurants');
        
        const { data: randomRestaurants, error: randomError } = await supabase
          .from('restaurants')
          .select(`
            id,
            name,
            description,
            image_url,
            cover_image_url,
            location,
            cuisine_type
          `)
          .limit(6);

        if (randomError) {
          console.error('❌ useRandomRestaurants: Error fetching random restaurants:', randomError);
          setError('Error al obtener restaurantes');
          return;
        }

        // Transformar los datos para que coincidan con la interfaz esperada
        const transformedRestaurants = (randomRestaurants || []).map(restaurant => ({
          ...restaurant,
          followers_count: 0
        }));

        console.log('✅ useRandomRestaurants: Fallback restaurants:', transformedRestaurants.length);
        setRestaurants(transformedRestaurants);
      } else {
        console.log('✅ useRandomRestaurants: City restaurants found:', cityRestaurants.length);
        setRestaurants(cityRestaurants || []);
      }
    } catch (error) {
      console.error('❌ useRandomRestaurants: Unexpected error:', error);
      setError('Error inesperado al cargar restaurantes');
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
    error,
    refetch: fetchRandomRestaurants
  };
};
