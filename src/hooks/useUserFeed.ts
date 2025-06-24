
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

    // Validar que los arrays existan y sean válidos
    if (!Array.isArray(posts) && !Array.isArray(sharedPosts)) {
      console.log('⏳ useUserFeed: Datos aún no disponibles');
      return [];
    }

    const combined: CombinedFeedItem[] = [];

    // Add user's own posts with validation
    if (Array.isArray(posts)) {
      const userPosts = posts.filter(post => 
        post && 
        typeof post === 'object' && 
        post.author_id === targetUserId &&
        post.id &&
        post.created_at
      );
      
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

    // Add user's shared posts with validation
    if (Array.isArray(sharedPosts)) {
      const userSharedPosts = sharedPosts.filter(
        sharedPost => 
          sharedPost && 
          typeof sharedPost === 'object' && 
          sharedPost.sharer_id === targetUserId &&
          sharedPost.id &&
          sharedPost.created_at
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

    // Sort by creation date (newest first) with error handling
    combined.sort((a, b) => {
      try {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
      } catch (error) {
        console.warn('⚠️ useUserFeed: Error sorting dates:', error);
        return 0;
      }
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

  // Calculate loading state with safe checking
  const isLoading = useMemo(() => {
    const loading = postsLoading || sharedPostsLoading || manualLoading;
    console.log('⏳ useUserFeed: Estado de carga:', { postsLoading, sharedPostsLoading, manualLoading, loading });
    return loading;
  }, [postsLoading, sharedPostsLoading, manualLoading]);

  const refreshFeed = useCallback(async () => {
    console.log('🔄 useUserFeed: Iniciando refresh manual del feed...');
    setManualLoading(true);
    
    try {
      // Usar Promise.allSettled para manejar errores individuales
      const results = await Promise.allSettled([
        refreshPosts(),
        refetchSharedPosts()
      ]);
      
      // Log results for debugging
      results.forEach((result, index) => {
        const source = index === 0 ? 'posts' : 'sharedPosts';
        if (result.status === 'rejected') {
          console.error(`❌ useUserFeed: Error refreshing ${source}:`, result.reason);
        } else {
          console.log(`✅ useUserFeed: ${source} refreshed successfully`);
        }
      });
      
      console.log('✅ useUserFeed: Feed refresh completado');
    } catch (error) {
      console.error('❌ useUserFeed: Error general en refresh:', error);
    } finally {
      setManualLoading(false);
    }
  }, [refreshPosts, refetchSharedPosts]);

  // Memoize the stats to prevent recalculation with safe checking
  const stats = useMemo(() => {
    if (!Array.isArray(combinedFeed)) {
      return { postsCount: 0, sharedPostsCount: 0 };
    }
    
    return {
      postsCount: combinedFeed.filter(item => item?.type === 'post').length,
      sharedPostsCount: combinedFeed.filter(item => item?.type === 'shared_post').length
    };
  }, [combinedFeed]);

  return {
    combinedFeed,
    loading: isLoading,
    refreshFeed,
    isEmpty: Array.isArray(combinedFeed) && combinedFeed.length === 0 && !isLoading,
    postsCount: stats.postsCount,
    sharedPostsCount: stats.sharedPostsCount
  };
};
