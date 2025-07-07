
import { useState, useEffect, useCallback, useMemo } from 'react';
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

  // Memoize user ID to prevent unnecessary re-renders
  const userId = useMemo(() => user?.id, [user?.id]);

  const fetchFollowing = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch followed users - first get the follow relationships
      const { data: userFollowsData, error: userFollowsError } = await supabase
        .from('user_follows')
        .select('followed_user_id')
        .eq('follower_id', userId)
        .not('followed_user_id', 'is', null);

      if (userFollowsError) {
        console.error('Error fetching user follows:', userFollowsError);
      } else if (userFollowsData && userFollowsData.length > 0) {
        // Then fetch the user details from the public users table
        const followedUserIds = userFollowsData.map(f => f.followed_user_id).filter(Boolean);
        
        if (followedUserIds.length > 0) {
          const { data: usersData, error: usersError } = await supabase
            .from('users')
            .select('id, full_name, username, avatar_url')
            .in('id', followedUserIds);

          if (usersError) {
            console.error('Error fetching users data:', usersError);
          } else {
            setFollowedUsers(usersData || []);
          }
        }
      }

      // Fetch followed restaurants
      const { data: restaurantFollowsData, error: restaurantFollowsError } = await supabase
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
        .eq('follower_id', userId)
        .not('followed_restaurant_id', 'is', null);

      if (restaurantFollowsError) {
        console.error('Error fetching followed restaurants:', restaurantFollowsError);
      } else {
        const restaurants = (restaurantFollowsData || [])
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
  }, [userId]);

  useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      if (mounted) {
        await fetchFollowing();
      }
    };
    
    loadData();
    
    return () => {
      mounted = false;
    };
  }, [fetchFollowing]);

  return {
    followedUsers,
    followedRestaurants,
    loading,
    error,
    refetch: fetchFollowing
  };
};
