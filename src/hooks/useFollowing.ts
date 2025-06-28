
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface FollowedUser {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string;
}

interface FollowedRestaurant {
  id: string;
  name: string;
  image_url: string;
  cover_image_url: string;
  location: string;
  cuisine_type: string;
}

export const useFollowing = () => {
  const [followedUsers, setFollowedUsers] = useState<FollowedUser[]>([]);
  const [followedRestaurants, setFollowedRestaurants] = useState<FollowedRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchFollowing = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch followed users
      const { data: usersData, error: usersError } = await supabase
        .from('user_follows')
        .select(`
          followed_user_id,
          users!user_follows_followed_user_id_fkey (
            id,
            full_name,
            username,
            avatar_url
          )
        `)
        .eq('follower_id', user.id)
        .not('followed_user_id', 'is', null);

      if (usersError) {
        console.error('Error fetching followed users:', usersError);
      } else {
        const users = (usersData || [])
          .map(item => item.users)
          .filter(Boolean) as FollowedUser[];
        setFollowedUsers(users);
      }

      // Fetch followed restaurants
      const { data: restaurantsData, error: restaurantsError } = await supabase
        .from('user_follows')
        .select(`
          followed_restaurant_id,
          restaurants!user_follows_followed_restaurant_id_fkey (
            id,
            name,
            image_url,
            cover_image_url,
            location,
            cuisine_type
          )
        `)
        .eq('follower_id', user.id)
        .not('followed_restaurant_id', 'is', null);

      if (restaurantsError) {
        console.error('Error fetching followed restaurants:', restaurantsError);
      } else {
        const restaurants = (restaurantsData || [])
          .map(item => item.restaurants)
          .filter(Boolean) as FollowedRestaurant[];
        setFollowedRestaurants(restaurants);
      }
    } catch (error) {
      console.error('Error fetching following data:', error);
      setError('Error al cargar datos de seguimiento');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFollowing();
  }, [fetchFollowing]);

  return {
    followedUsers,
    followedRestaurants,
    loading,
    error,
    refetch: fetchFollowing
  };
};
