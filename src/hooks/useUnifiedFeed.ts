
import { useCallback } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Post } from '@/types/post';
import { SharedPost } from '@/types/sharedPost';

export interface UnifiedFeedItem {
  type: 'post' | 'shared_post';
  data: Post | SharedPost;
  created_at: string;
  id: string;
}

interface UseUnifiedFeedOptions {
  pageSize?: number;
}

export const useUnifiedFeed = (options?: UseUnifiedFeedOptions) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const pageSize = options?.pageSize || 10;

  const fetchUnifiedFeed = useCallback(async ({ pageParam = 0 }) => {
    console.log('🔥 useUnifiedFeed: Fetching unified feed...', { pageParam, pageSize, timestamp: new Date().toISOString() });

    try {
      // Fetch posts normales públicos
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          id, 
          author_id, 
          created_at, 
          content, 
          location, 
          restaurant_id, 
          recipe_id,
          media_urls,
          users!posts_author_id_fkey (
            full_name,
            username,
            avatar_url
          ),
          restaurants (
            name
          )
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .range(pageParam * pageSize, (pageParam + 1) * pageSize - 1);

      if (postsError) {
        console.error('❌ useUnifiedFeed: Error fetching posts:', postsError);
        throw postsError;
      }

      // Fetch publicaciones compartidas
      const { data: sharedPostsData, error: sharedError } = await supabase
        .from('shared_posts')
        .select(`
          id,
          created_at,
          updated_at,
          comment,
          shared_type,
          sharer_id,
          shared_post_id,
          shared_recipe_id,
          shared_restaurant_id,
          users!shared_posts_sharer_id_fkey (
            full_name,
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .range(pageParam * pageSize, (pageParam + 1) * pageSize - 1);

      if (sharedError) {
        console.error('❌ useUnifiedFeed: Error fetching shared posts:', sharedError);
        throw sharedError;
      }

      console.log('📊 useUnifiedFeed: Raw data received:', {
        postsCount: postsData?.length || 0,
        sharedPostsCount: sharedPostsData?.length || 0
      });

      // Procesar posts normales
      const processedPosts = await Promise.all(
        (postsData || []).map(async (post: any) => {
          const [cheersResult, commentsResult] = await Promise.all([
            supabase
              .from('cheers')
              .select('*', { count: 'exact', head: true })
              .eq('post_id', post.id),
            supabase
              .from('comments')
              .select('*', { count: 'exact', head: true })
              .eq('post_id', post.id)
          ]);

          const processedPost: Post = {
            id: post.id,
            author_id: post.author_id,
            created_at: post.created_at,
            content: post.content,
            location: post.location,
            restaurant_id: post.restaurant_id,
            recipe_id: post.recipe_id,
            media_urls: post.media_urls,
            cheers_count: cheersResult.count || 0,
            comments_count: commentsResult.count || 0,
            author_name: post.users?.full_name || 'Usuario',
            author_username: post.users?.username || 'usuario',
            author_avatar: post.users?.avatar_url || '',
            restaurant_name: post.restaurants?.name || undefined,
            is_shared: false
          };

          return {
            type: 'post' as const,
            data: processedPost,
            created_at: post.created_at,
            id: `post-${post.id}`
          };
        })
      );

      // Procesar publicaciones compartidas con contenido original
      const processedSharedPosts = await Promise.all(
        (sharedPostsData || []).map(async (sharedPost: any) => {
          console.log('🔄 useUnifiedFeed: Processing shared post:', {
            id: sharedPost.id,
            sharedType: sharedPost.shared_type
          });

          // Obtener conteos para la publicación compartida
          const [cheersResult, commentsResult] = await Promise.all([
            supabase
              .from('cheers')
              .select('*', { count: 'exact', head: true })
              .eq('post_id', sharedPost.id),
            supabase
              .from('comments')
              .select('*', { count: 'exact', head: true })
              .eq('post_id', sharedPost.id)
          ]);

          // Verificar si el usuario actual ha dado cheer
          let hasCheered = false;
          if (user) {
            const { data: cheerData } = await supabase
              .from('cheers')
              .select('id')
              .eq('post_id', sharedPost.id)
              .eq('user_id', user.id)
              .single();
            hasCheered = !!cheerData;
          }

          // Obtener contenido original
          let originalContent = null;
          try {
            if (sharedPost.shared_type === 'post' && sharedPost.shared_post_id) {
              console.log('📝 useUnifiedFeed: Fetching original post:', sharedPost.shared_post_id);
              const { data } = await supabase
                .from('posts')
                .select(`
                  id,
                  content,
                  location,
                  media_urls,
                  created_at,
                  users!posts_author_id_fkey(id, full_name, username, avatar_url),
                  restaurants(name)
                `)
                .eq('id', sharedPost.shared_post_id)
                .eq('is_public', true)
                .single();
              
              if (data) {
                originalContent = {
                  id: data.id,
                  content: data.content,
                  location: data.location,
                  media_urls: data.media_urls,
                  created_at: data.created_at,
                  author: data.users ? {
                    id: data.users.id,
                    full_name: data.users.full_name,
                    username: data.users.username,
                    avatar_url: data.users.avatar_url
                  } : undefined,
                  restaurant_name: data.restaurants?.name
                };
              }
            } else if (sharedPost.shared_type === 'recipe' && sharedPost.shared_recipe_id) {
              const { data } = await supabase
                .from('recipes')
                .select(`
                  id,
                  title,
                  description,
                  image_url,
                  prep_time,
                  cook_time,
                  servings,
                  cuisine_type,
                  created_at,
                  users!recipes_author_id_fkey(id, full_name, username, avatar_url)
                `)
                .eq('id', sharedPost.shared_recipe_id)
                .eq('is_public', true)
                .single();
              
              if (data) {
                originalContent = {
                  id: data.id,
                  title: data.title,
                  description: data.description,
                  image_url: data.image_url,
                  prep_time: data.prep_time,
                  cook_time: data.cook_time,
                  servings: data.servings,
                  cuisine_type: data.cuisine_type,
                  created_at: data.created_at,
                  author: data.users ? {
                    id: data.users.id,
                    full_name: data.users.full_name,
                    username: data.users.username,
                    avatar_url: data.users.avatar_url
                  } : undefined
                };
              }
            } else if (sharedPost.shared_type === 'restaurant' && sharedPost.shared_restaurant_id) {
              const { data } = await supabase
                .from('restaurants')
                .select(`
                  id,
                  name,
                  description,
                  image_url,
                  cover_image_url,
                  location,
                  cuisine_type,
                  created_at
                `)
                .eq('id', sharedPost.shared_restaurant_id)
                .single();
              
              if (data) {
                originalContent = {
                  id: data.id,
                  name: data.name,
                  description: data.description,
                  image_url: data.image_url,
                  cover_image_url: data.cover_image_url,
                  location: data.location,
                  cuisine_type: data.cuisine_type,
                  created_at: data.created_at
                };
              }
            }
          } catch (error) {
            console.warn('⚠️ useUnifiedFeed: Error fetching original content:', error);
          }

          const processedSharedPost: SharedPost = {
            id: sharedPost.id,
            sharer_id: sharedPost.sharer_id,
            shared_type: sharedPost.shared_type,
            shared_post_id: sharedPost.shared_post_id,
            shared_recipe_id: sharedPost.shared_recipe_id,
            shared_restaurant_id: sharedPost.shared_restaurant_id,
            comment: sharedPost.comment,
            created_at: sharedPost.created_at,
            updated_at: sharedPost.updated_at,
            sharer: sharedPost.users || {
              id: sharedPost.sharer_id,
              full_name: 'Usuario desconocido',
              username: 'usuario',
              avatar_url: ''
            },
            original_content: originalContent,
            cheers_count: cheersResult.count || 0,
            comments_count: commentsResult.count || 0,
            has_cheered: hasCheered
          };

          return {
            type: 'shared_post' as const,
            data: processedSharedPost,
            created_at: sharedPost.created_at,
            id: `shared-${sharedPost.id}`
          };
        })
      );

      // Combinar y ordenar por fecha
      const allItems = [...processedPosts, ...processedSharedPosts];
      allItems.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
      });

      console.log('✅ useUnifiedFeed: Unified feed processed:', {
        totalItems: allItems.length,
        posts: processedPosts.length,
        sharedPosts: processedSharedPosts.length,
        pageParam
      });

      return allItems;
    } catch (error) {
      console.error('❌ useUnifiedFeed: Error in fetchUnifiedFeed:', error);
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
    queryKey: ['unified-feed'],
    queryFn: fetchUnifiedFeed,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < pageSize) {
        return undefined;
      }
      return allPages.length;
    },
    staleTime: 15 * 1000, // 15 segundos para mejor responsividad
    gcTime: 2 * 60 * 1000, // 2 minutos
  });

  const feedItems = data?.pages?.flat() || [];

  const refreshFeed = useCallback(async () => {
    console.log('🔄 useUnifiedFeed: Manual refresh requested...');
    try {
      await refetch();
      console.log('✅ useUnifiedFeed: Manual refresh completed');
    } catch (error) {
      console.error('❌ useUnifiedFeed: Error in manual refresh:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el feed",
        variant: "destructive"
      });
    }
  }, [refetch, toast]);

  const invalidateAndRefresh = useCallback(async () => {
    console.log('🔄 useUnifiedFeed: Invalidating and refreshing...');
    try {
      await queryClient.invalidateQueries({ queryKey: ['unified-feed'] });
      await queryClient.invalidateQueries({ queryKey: ['posts'] });
      await queryClient.invalidateQueries({ queryKey: ['shared-posts'] });
      console.log('✅ useUnifiedFeed: Cache invalidated and refreshed');
    } catch (error) {
      console.error('❌ useUnifiedFeed: Error invalidating cache:', error);
    }
  }, [queryClient]);

  const loadMore = useCallback(async () => {
    if (hasNextPage && !isFetchingNextPage) {
      console.log('📄 useUnifiedFeed: Loading more items...');
      await fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return {
    feedItems,
    loading: isLoading,
    hasMore: !!hasNextPage,
    loadMore,
    isFetchingMore: isFetchingNextPage,
    refreshFeed,
    invalidateAndRefresh,
    error,
    isError,
    isEmpty: feedItems.length === 0 && !isLoading
  };
};
