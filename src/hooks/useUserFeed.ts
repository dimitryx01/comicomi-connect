
import { useState, useEffect, useMemo } from 'react';
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
  const [loading, setLoading] = useState(false);
  
  // Use existing hooks for data fetching
  const { posts, loading: postsLoading, refreshPosts } = usePosts();
  const { sharedPosts, loading: sharedPostsLoading, refetch: refetchSharedPosts } = useSharedPostsQuery();

  const targetUserId = userId || user?.id;

  console.log('🔄 useUserFeed: Hook iniciado con datos:', {
    targetUserId,
    currentUserId: user?.id,
    postsLoading,
    sharedPostsLoading,
    postsCount: posts?.length || 0,
    sharedPostsCount: sharedPosts?.length || 0
  });

  // Memoize the combined feed to prevent infinite re-renders
  const combinedFeed = useMemo(() => {
    if (!targetUserId || postsLoading || sharedPostsLoading) {
      console.log('⏳ useUserFeed: Esperando datos - targetUserId:', targetUserId, 'postsLoading:', postsLoading, 'sharedPostsLoading:', sharedPostsLoading);
      return [];
    }

    console.log('🔄 useUserFeed: Procesando datos memoizados:', {
      postsCount: posts?.length || 0,
      sharedPostsCount: sharedPosts?.length || 0,
      targetUserId
    });

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

    console.log('✅ useUserFeed: Feed combinado memoizado:', {
      totalItems: combined.length,
      breakdown: {
        posts: combined.filter(item => item.type === 'post').length,
        sharedPosts: combined.filter(item => item.type === 'shared_post').length
      }
    });

    return combined;
  }, [posts, sharedPosts, targetUserId, postsLoading, sharedPostsLoading]);

  // Simple effect to manage loading state
  useEffect(() => {
    const isLoading = postsLoading || sharedPostsLoading;
    console.log('🔄 useUserFeed: Actualizando estado de loading:', { isLoading, postsLoading, sharedPostsLoading });
    setLoading(isLoading);
  }, [postsLoading, sharedPostsLoading]);

  const refreshFeed = async () => {
    console.log('🔄 useUserFeed: Refrescando feed completo...');
    setLoading(true);
    
    try {
      await Promise.all([
        refreshPosts(),
        refetchSharedPosts()
      ]);
      console.log('✅ useUserFeed: Feed refrescado exitosamente');
    } catch (error) {
      console.error('❌ useUserFeed: Error refrescando feed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Memoize the stats to prevent recalculation
  const stats = useMemo(() => ({
    postsCount: combinedFeed.filter(item => item.type === 'post').length,
    sharedPostsCount: combinedFeed.filter(item => item.type === 'shared_post').length
  }), [combinedFeed]);

  return {
    combinedFeed,
    loading: loading || postsLoading || sharedPostsLoading,
    refreshFeed,
    isEmpty: combinedFeed.length === 0,
    postsCount: stats.postsCount,
    sharedPostsCount: stats.sharedPostsCount
  };
};
