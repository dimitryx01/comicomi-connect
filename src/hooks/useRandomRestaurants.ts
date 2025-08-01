
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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

// Cache para evitar llamadas innecesarias
const restaurantsCache = new Map<string, { data: RandomRestaurant[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export const useRandomRestaurants = () => {
  const [restaurants, setRestaurants] = useState<RandomRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const debounceRef = useRef<NodeJS.Timeout>();

  // Memoize user ID to prevent unnecessary re-renders
  const userId = useMemo(() => user?.id, [user?.id]);

  const fetchRandomRestaurants = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Clear any existing debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce para evitar llamadas excesivas
    debounceRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtener datos del usuario primero
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('city, location, country')
          .eq('id', userId)
          .maybeSingle();

        if (userError) {
          console.error('❌ useRandomRestaurants: Error fetching user data:', userError);
          setError('Error al obtener datos del usuario');
          setLoading(false);
          return;
        }

        // Determinar la ciudad a usar para la búsqueda
        let searchCity = userData?.city || userData?.location || userData?.country || 'Madrid';

        // Verificar cache primero
        const cacheKey = `restaurants_${searchCity}`;
        const cached = restaurantsCache.get(cacheKey);
        const now = Date.now();
        
        if (cached && (now - cached.timestamp) < CACHE_TTL) {
          console.log('✅ useRandomRestaurants: Using cached data for:', searchCity);
          setRestaurants(cached.data);
          setLoading(false);
          return;
        }

        console.log('🔍 useRandomRestaurants: Fetching fresh data for city:', searchCity);

        // Usar query optimizada con un solo round-trip
        const { data: cityRestaurants, error: cityError } = await supabase
          .rpc('get_random_restaurants_by_city', {
            user_city: searchCity,
            limit_count: 6
          });

        if (cityError || !cityRestaurants || cityRestaurants.length === 0) {
          // Fallback con query simple optimizada
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
            .order('created_at', { ascending: false })
            .limit(6);

          if (randomError) {
            console.error('❌ useRandomRestaurants: Error fetching restaurants:', randomError);
            setError('Error al obtener restaurantes');
            return;
          }

          const transformedRestaurants = (randomRestaurants || []).map(restaurant => ({
            ...restaurant,
            followers_count: 0
          }));

          // Cache el resultado
          restaurantsCache.set(cacheKey, {
            data: transformedRestaurants,
            timestamp: now
          });

          setRestaurants(transformedRestaurants);
        } else {
          // Cache el resultado exitoso
          restaurantsCache.set(cacheKey, {
            data: cityRestaurants,
            timestamp: now
          });

          setRestaurants(cityRestaurants);
        }
      } catch (error) {
        console.error('❌ useRandomRestaurants: Unexpected error:', error);
        setError('Error inesperado al cargar restaurantes');
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce
  }, [userId]);

  useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      if (mounted) {
        await fetchRandomRestaurants();
      }
    };
    
    loadData();
    
    return () => {
      mounted = false;
    };
  }, [fetchRandomRestaurants]);

  return {
    restaurants,
    loading,
    error,
    refetch: fetchRandomRestaurants
  };
};
