
import { useState, useEffect } from 'react';
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
  const [combinedFeed, setCombinedFeed] = useState<CombinedFeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Use existing hooks for data fetching
  const { posts, loading: postsLoading, refreshPosts } = usePosts();
  const { data: sharedPostsData, isLoading: sharedPostsLoading, refetch: refetchSharedPosts } = useSharedPostsQuery();

  const targetUserId = userId || user?.id;

  console.log('🔄 useUserFeed: Iniciando hook para usuario:', {
    targetUserId,
    currentUserId: user?.id,
    postsLoading,
    sharedPostsLoading
  });

  useEffect(() => {
    if (!targetUserId) {
      console.log('⚠️ useUserFeed: No hay usuario objetivo, limpiando feed');
      setCombinedFeed([]);
      return;
    }

    if (postsLoading || sharedPostsLoading) {
      console.log('🔄 useUserFeed: Cargando datos...');
      setLoading(true);
      return;
    }

    console.log('📊 useUserFeed: Procesando datos obtenidos:', {
      postsCount: posts?.length || 0,
      sharedPostsCount: sharedPostsData?.sharedPosts?.length || 0,
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
    if (sharedPostsData?.sharedPosts && Array.isArray(sharedPostsData.sharedPosts)) {
      const userSharedPosts = sharedPostsData.sharedPosts.filter(
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

    console.log('✅ useUserFeed: Feed combinado creado:', {
      totalItems: combined.length,
      breakdown: {
        posts: combined.filter(item => item.type === 'post').length,
        sharedPosts: combined.filter(item => item.type === 'shared_post').length
      }
    });

    setCombinedFeed(combined);
    setLoading(false);
  }, [posts, sharedPostsData, postsLoading, sharedPostsLoading, targetUserId]);

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

  return {
    combinedFeed,
    loading: loading || postsLoading || sharedPostsLoading,
    refreshFeed,
    isEmpty: combinedFeed.length === 0,
    postsCount: combinedFeed.filter(item => item.type === 'post').length,
    sharedPostsCount: combinedFeed.filter(item => item.type === 'shared_post').length
  };
};
