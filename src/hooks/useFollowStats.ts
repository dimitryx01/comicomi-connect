import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/utils/logConfig';

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
  const fetchInProgressRef = useRef(false);
  
  // Memoize user ID and target ID to prevent unnecessary re-renders
  const userId = useMemo(() => user?.id, [user?.id]);
  const memoizedTargetId = useMemo(() => targetUserId, [targetUserId]);

  const fetchStats = useCallback(async () => {
    if (!memoizedTargetId || fetchInProgressRef.current) {
      setLoading(false);
      return;
    }

    try {
      fetchInProgressRef.current = true;
      setLoading(true);
      logger.log('useUserFollowStats', `Fetching stats for user ${memoizedTargetId}`);

      // Get followers count
      const { data: followersData } = await supabase
        .rpc('count_user_followers', { target_user_id: memoizedTargetId });

      // Get following count
      const { data: followingData } = await supabase
        .rpc('count_user_following', { user_uuid: memoizedTargetId });

      // Check if current user is following this user
      let isFollowing = false;
      if (userId && userId !== memoizedTargetId) {
        const { data: followingStatus, error } = await supabase
          .from('user_follows')
          .select('id')
          .eq('follower_id', userId)
          .eq('followed_user_id', memoizedTargetId)
          .maybeSingle();

        if (!error) {
          isFollowing = !!followingStatus;
        }
      }

      logger.log('useUserFollowStats', `Stats fetched for user ${memoizedTargetId}`, {
        followersCount: followersData || 0,
        followingCount: followingData || 0,
        isFollowing
      });

      setStats({
        followersCount: followersData || 0,
        followingCount: followingData || 0,
        isFollowing
      });
    } catch (error) {
      logger.error('useUserFollowStats', `Error fetching stats for user ${memoizedTargetId}`, error);
    } finally {
      setLoading(false);
      fetchInProgressRef.current = false;
    }
  }, [memoizedTargetId, userId]);

  useEffect(() => {
    if (memoizedTargetId) {
      fetchStats();
    }
    
    return () => {
      // Cleanup
    };
  }, [memoizedTargetId, fetchStats]);

  // Funciu00f3n para actualizar el estado inmediatamente sin esperar refetch
  const updateFollowState = useCallback((newIsFollowing: boolean) => {
    logger.log('useUserFollowStats', `Updating follow state locally to ${newIsFollowing}`);
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
  const fetchInProgressRef = useRef(false);
  
  // Memoize user ID and restaurant ID to prevent unnecessary re-renders
  const userId = useMemo(() => user?.id, [user?.id]);
  const memoizedRestaurantId = useMemo(() => restaurantId, [restaurantId]);

  const fetchStats = useCallback(async () => {
    if (!memoizedRestaurantId || fetchInProgressRef.current) {
      setLoading(false);
      return;
    }

    try {
      fetchInProgressRef.current = true;
      setLoading(true);
      logger.log('useRestaurantFollowStats', `Fetching stats for restaurant ${memoizedRestaurantId}`);

      // Get followers count
      const { data: followersData } = await supabase
        .rpc('count_restaurant_followers', { restaurant_uuid: memoizedRestaurantId });

      // Check if current user is following this restaurant
      let followingStatus = false;
      if (userId) {
        const { data, error } = await supabase
          .from('user_follows')
          .select('id')
          .eq('follower_id', userId)
          .eq('followed_restaurant_id', memoizedRestaurantId)
          .maybeSingle();

        if (!error) {
          followingStatus = !!data;
        }
      }

      logger.log('useRestaurantFollowStats', `Stats fetched for restaurant ${memoizedRestaurantId}`, {
        followersCount: followersData || 0,
        isFollowing: followingStatus
      });

      setFollowersCount(followersData || 0);
      setIsFollowing(followingStatus);
    } catch (error) {
      logger.error('useRestaurantFollowStats', `Error fetching stats for restaurant ${memoizedRestaurantId}`, error);
    } finally {
      setLoading(false);
      fetchInProgressRef.current = false;
    }
  }, [memoizedRestaurantId, userId]);

  useEffect(() => {
    if (memoizedRestaurantId) {
      fetchStats();
    }
    
    return () => {
      // Cleanup
    };
  }, [memoizedRestaurantId, fetchStats]);

  // Funciu00f3n para actualizar el estado inmediatamente sin esperar refetch
  const updateFollowState = useCallback((newIsFollowing: boolean) => {
    logger.log('useRestaurantFollowStats', `Updating follow state locally to ${newIsFollowing}`);
    setIsFollowing(newIsFollowing);
    setFollowersCount(prev => prev + (newIsFollowing ? 1 : -1));
  }, []);

  return { followersCount, isFollowing, loading, refreshStats: fetchStats, updateFollowState };
};