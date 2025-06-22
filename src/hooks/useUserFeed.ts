
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePosts } from '@/hooks/usePosts';
import { useSharedPostsQuery } from '@/hooks/useSharedPostsQuery';
import { Post } from '@/types/post';
import { SharedPost } from '@/types/sharedPost';

export interface CombinedFeedItem {
  type: 'post' | 'shared_post';
  data: Post | SharedPost;
  created_at: string;
  id: string;
}

export const useUserFeed = (userId?: string) => {
  const { user } = useAuth();
  const [manualLoading, setManualLoading] = useState(false);
  
  // Use existing hooks for data fetching
  const { posts, loading: postsLoading, refreshPosts } = usePosts();
  const { sharedPosts, loading: sharedPostsLoading, refetch: refetchSharedPosts } = useSharedPostsQuery();

  const targetUserId = userId || user?.id;

  console.log('🔄 useUserFeed: Hook state:', {
    targetUserId,
    currentUserId: user?.id,
    postsLoading,
    sharedPostsLoading,
    postsCount: posts?.length || 0,
    sharedPostsCount: sharedPosts?.length || 0,
    manualLoading
  });

  // Memoize the combined feed to prevent infinite re-renders
  const combinedFeed = useMemo(() => {
    console.log('📊 useUserFeed: Recalculando feed combinado');
    
    if (!targetUserId) {
      console.log('⏳ useUserFeed: No hay targetUserId');
      return [];
    }

    const combined: CombinedFeedItem[] = [];

    // Add user's own posts
    if (posts && Array.isArray(posts)) {
      const userPosts = posts.filter(post => post.author_id === targetUserId);
      console.log('📝 useUserFeed: Posts propios encontrados:', userPosts.length);
      
      userPosts.forEach(post => {
        combined.push({
          type: 'post',
          data: post,
          created_at: post.created_at,
          id: `post-${post.id}`
        });
      });
    }

    // Add user's shared posts
    if (sharedPosts && Array.isArray(sharedPosts)) {
      const userSharedPosts = sharedPosts.filter(
        sharedPost => sharedPost.sharer_id === targetUserId
      );
      console.log('🔄 useUserFeed: Posts compartidos encontrados:', userSharedPosts.length);
      
      userSharedPosts.forEach(sharedPost => {
        combined.push({
          type: 'shared_post',
          data: sharedPost,
          created_at: sharedPost.created_at,
          id: `shared-${sharedPost.id}`
        });
      });
    }

    // Sort by creation date (newest first)
    combined.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });

    console.log('✅ useUserFeed: Feed combinado calculado:', {
      totalItems: combined.length,
      breakdown: {
        posts: combined.filter(item => item.type === 'post').length,
        sharedPosts: combined.filter(item => item.type === 'shared_post').length
      }
    });

    return combined;
  }, [posts, sharedPosts, targetUserId]);

  // Calculate loading state
  const isLoading = useMemo(() => {
    const loading = postsLoading || sharedPostsLoading || manualLoading;
    console.log('⏳ useUserFeed: Estado de carga:', { postsLoading, sharedPostsLoading, manualLoading, loading });
    return loading;
  }, [postsLoading, sharedPostsLoading, manualLoading]);

  const refreshFeed = useCallback(async () => {
    console.log('🔄 useUserFeed: Iniciando refresh manual del feed...');
    setManualLoading(true);
    
    try {
      await Promise.all([
        refreshPosts(),
        refetchSharedPosts()
      ]);
      console.log('✅ useUserFeed: Feed refrescado exitosamente');
    } catch (error) {
      console.error('❌ useUserFeed: Error refrescando feed:', error);
    } finally {
      setManualLoading(false);
    }
  }, [refreshPosts, refetchSharedPosts]);

  // Memoize the stats to prevent recalculation
  const stats = useMemo(() => ({
    postsCount: combinedFeed.filter(item => item.type === 'post').length,
    sharedPostsCount: combinedFeed.filter(item => item.type === 'shared_post').length
  }), [combinedFeed]);

  return {
    combinedFeed,
    loading: isLoading,
    refreshFeed,
    isEmpty: combinedFeed.length === 0 && !isLoading,
    postsCount: stats.postsCount,
    sharedPostsCount: stats.sharedPostsCount
  };
};
