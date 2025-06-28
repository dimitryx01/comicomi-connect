
import { useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface PersonalizedFeedItem {
  content_type: 'post' | 'shared_post' | 'recipe';
  content_id: string;
  content_data: any;
  relevance_score: number;
  created_at: string;
}

interface UsePersonalizedFeedOptions {
  pageSize?: number;
}

export const usePersonalizedFeed = (options?: UsePersonalizedFeedOptions) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const pageSize = options?.pageSize || 10;

  const fetchPersonalizedFeed = useCallback(async ({ pageParam = 0 }) => {
    console.log('🔥 usePersonalizedFeed: Fetching personalized feed...', { 
      pageParam, 
      pageSize, 
      userId: user?.id,
      timestamp: new Date().toISOString() 
    });

    if (!user) {
      console.warn('⚠️ usePersonalizedFeed: No user authenticated');
      return [];
    }

    try {
      const { data, error } = await supabase
        .rpc('get_personalized_unified_feed', {
          user_uuid: user.id,
          page_size: pageSize,
          page_offset: pageParam * pageSize
        });

      if (error) {
        console.error('❌ usePersonalizedFeed: Error fetching feed:', error);
        throw error;
      }

      console.log('✅ usePersonalizedFeed: Feed obtenido:', {
        itemsCount: data?.length || 0,
        pageParam,
        breakdown: {
          posts: data?.filter((item: any) => item.content_type === 'post').length || 0,
          sharedPosts: data?.filter((item: any) => item.content_type === 'shared_post').length || 0,
          recipes: data?.filter((item: any) => item.content_type === 'recipe').length || 0
        }
      });

      return (data || []).map((item: any) => ({
        content_type: item.content_type,
        content_id: item.content_id,
        content_data: item.content_data,
        relevance_score: item.relevance_score,
        created_at: item.created_at
      })) as PersonalizedFeedItem[];
    } catch (error) {
      console.error('❌ usePersonalizedFeed: Error in fetchPersonalizedFeed:', error);
      throw error;
    }
  }, [pageSize, user]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey: ['personalized-feed', user?.id],
    queryFn: fetchPersonalizedFeed,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < pageSize) {
        return undefined;
      }
      return allPages.length;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!user
  });

  const feedItems = data?.pages?.flat() || [];

  const loadMore = useCallback(async () => {
    if (hasNextPage && !isFetchingNextPage) {
      console.log('📄 usePersonalizedFeed: Loading more items...');
      await fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const refreshFeed = useCallback(async () => {
    console.log('🔄 usePersonalizedFeed: Manual refresh requested...');
    try {
      await refetch();
      console.log('✅ usePersonalizedFeed: Manual refresh completed');
    } catch (error) {
      console.error('❌ usePersonalizedFeed: Error in manual refresh:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el feed",
        variant: "destructive"
      });
    }
  }, [refetch, toast]);

  return {
    feedItems,
    loading: isLoading,
    hasMore: !!hasNextPage,
    loadMore,
    isFetchingMore: isFetchingNextPage,
    refreshFeed,
    error,
    isError,
    isEmpty: feedItems.length === 0 && !isLoading
  };
};
