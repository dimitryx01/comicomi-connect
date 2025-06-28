
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

      // Check if current user is following this user - MEJORADO
      let isFollowing = false;
      if (user && user.id !== targetUserId) {
        // Consulta directa a la tabla para mayor precisión
        const { data: followingStatus, error } = await supabase
          .from('user_follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('followed_user_id', targetUserId)
          .maybeSingle();

        if (error) {
          console.error('Error checking follow status:', error);
        } else {
          isFollowing = !!followingStatus;
        }

        console.log('🔍 useUserFollowStats: Estado de seguimiento actualizado:', {
          targetUserId,
          currentUserId: user.id,
          isFollowing,
          followRecord: followingStatus
        });
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

  // Función para actualizar el estado inmediatamente sin esperar refetch
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

      // Check if current user is following this restaurant - MEJORADO
      let followingStatus = false;
      if (user) {
        // Consulta directa a la tabla para mayor precisión
        const { data, error } = await supabase
          .from('user_follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('followed_restaurant_id', restaurantId)
          .maybeSingle();

        if (error) {
          console.error('Error checking restaurant follow status:', error);
        } else {
          followingStatus = !!data;
        }

        console.log('🔍 useRestaurantFollowStats: Estado de seguimiento actualizado:', {
          restaurantId,
          currentUserId: user.id,
          isFollowing: followingStatus,
          followRecord: data
        });
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

  // Función para actualizar el estado inmediatamente sin esperar refetch
  const updateFollowState = useCallback((newIsFollowing: boolean) => {
    setIsFollowing(newIsFollowing);
    setFollowersCount(prev => prev + (newIsFollowing ? 1 : -1));
  }, []);

  return { followersCount, isFollowing, loading, refreshStats: fetchStats, updateFollowState };
};
