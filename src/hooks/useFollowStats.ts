
import { useState, useEffect, useCallback, useMemo } from 'react';
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

  // Memoize user ID to prevent unnecessary re-renders
  const currentUserId = useMemo(() => user?.id, [user?.id]);

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
      if (currentUserId && currentUserId !== targetUserId) {
        const { data: followingStatus } = await supabase
          .from('user_follows')
          .select('id')
          .eq('follower_id', currentUserId)
          .eq('followed_user_id', targetUserId)
          .maybeSingle();

        isFollowing = !!followingStatus;
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
  }, [targetUserId, currentUserId]);

  useEffect(() => {
    if (targetUserId) {
      fetchStats();
    }
  }, [fetchStats]);

  const updateFollowState = useCallback((newIsFollowing: boolean) => {
    setStats(prev => ({
      ...prev,
      isFollowing: newIsFollowing,
      followersCount: prev.followersCount + (newIsFollowing ? 1 : -1)
    }));
  }, []);

  return { ...stats, loading, refreshStats: fetchStats, updateFollowState };
};

export const useRestaurantFollowStats = (restaurantId?: string) => {
  const [followersCount, setFollowersCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Memoize user ID to prevent unnecessary re-renders
  const currentUserId = useMemo(() => user?.id, [user?.id]);

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
      if (currentUserId) {
        const { data } = await supabase
          .from('user_follows')
          .select('id')
          .eq('follower_id', currentUserId)
          .eq('followed_restaurant_id', restaurantId)
          .maybeSingle();

        followingStatus = !!data;
      }

      setFollowersCount(followersData || 0);
      setIsFollowing(followingStatus);
    } catch (error) {
      console.error('Error fetching restaurant follow stats:', error);
    } finally {
      setLoading(false);
    }
  }, [restaurantId, currentUserId]);

  useEffect(() => {
    if (restaurantId) {
      fetchStats();
    }
  }, [fetchStats]);

  const updateFollowState = useCallback((newIsFollowing: boolean) => {
    setIsFollowing(newIsFollowing);
    setFollowersCount(prev => prev + (newIsFollowing ? 1 : -1));
  }, []);

  return { followersCount, isFollowing, loading, refreshStats: fetchStats, updateFollowState };
};
