
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface FollowStats {
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
}

export const useUserFollowStats = (targetUserId?: string) => {
  const [stats, setStats] = useState<FollowStats>({
    followersCount: 0,
    followingCount: 0,
    isFollowing: false
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchStats = useCallback(async () => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Get followers count
      const { data: followersData } = await supabase
        .rpc('count_user_followers', { target_user_id: targetUserId });

      // Get following count
      const { data: followingData } = await supabase
        .rpc('count_user_following', { user_uuid: targetUserId });

      // Check if current user is following this user
      let isFollowing = false;
      if (user && user.id !== targetUserId) {
        const { data: followingStatus } = await supabase
          .rpc('is_following_user', { 
            follower_uuid: user.id, 
            target_user_id: targetUserId 
          });
        isFollowing = followingStatus || false;
      }

      setStats({
        followersCount: followersData || 0,
        followingCount: followingData || 0,
        isFollowing
      });
    } catch (error) {
      console.error('Error fetching user follow stats:', error);
    } finally {
      setLoading(false);
    }
  }, [targetUserId, user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { ...stats, loading, refreshStats: fetchStats };
};

export const useRestaurantFollowStats = (restaurantId?: string) => {
  const [followersCount, setFollowersCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchStats = useCallback(async () => {
    if (!restaurantId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Get followers count
      const { data: followersData } = await supabase
        .rpc('count_restaurant_followers', { restaurant_uuid: restaurantId });

      // Check if current user is following this restaurant
      let followingStatus = false;
      if (user) {
        const { data } = await supabase
          .rpc('is_following_restaurant', { 
            follower_uuid: user.id, 
            restaurant_uuid: restaurantId 
          });
        followingStatus = data || false;
      }

      setFollowersCount(followersData || 0);
      setIsFollowing(followingStatus);
    } catch (error) {
      console.error('Error fetching restaurant follow stats:', error);
    } finally {
      setLoading(false);
    }
  }, [restaurantId, user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { followersCount, isFollowing, loading, refreshStats: fetchStats };
};
