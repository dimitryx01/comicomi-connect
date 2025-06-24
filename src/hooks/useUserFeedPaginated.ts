
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Post } from '@/types/post';
import { SharedPost } from '@/types/sharedPost';
import { useToast } from '@/hooks/use-toast';

export interface CombinedFeedItem {
  type: 'post' | 'shared_post';
  data: Post | SharedPost;
  created_at: string;
  id: string;
}

interface UseUserFeedPaginatedOptions {
  postsPerPage?: number;
  userId?: string;
}

export const useUserFeedPaginated = (options?: UseUserFeedPaginatedOptions) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [manualLoading, setManualLoading] = useState(false);
  
  const postsPerPage = options?.postsPerPage || 10;
  const targetUserId = options?.userId || user?.id;

  console.log('🔄 useUserFeedPaginated: Inicializando con userId:', targetUserId);

  const fetchUserFeedPage = useCallback(async ({ pageParam = 0 }) => {
    if (!targetUserId) {
      console.log('❌ useUserFeedPaginated: No hay targetUserId');
      return [];
    }

    console.log('🔥 useUserFeedPaginated: Fetching page', pageParam, 'para usuario', targetUserId);

    const combined: CombinedFeedItem[] = [];

    // Obtener posts normales del usuario con paginación
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
      .eq('author_id', targetUserId)
      .order('created_at', { ascending: false })
      .range(pageParam * postsPerPage, (pageParam + 1) * postsPerPage - 1);

    if (postsError) {
      console.error('❌ useUserFeedPaginated: Error fetching posts:', postsError);
      throw postsError;
    }

    // Procesar posts normales
    if (postsData) {
      for (const post of postsData) {
        const { count: cheersCount } = await supabase
          .from('cheers')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);

        const { count: commentsCount } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);

        const processedPost: Post = {
          id: post.id,
          author_id: post.author_id,
          created_at: post.created_at,
          content: post.content,
          location: post.location,
          restaurant_id: post.restaurant_id,
          recipe_id: post.recipe_id,
          media_urls: post.media_urls,
          cheers_count: cheersCount || 0,
          comments_count: commentsCount || 0,
          author_name: post.users?.full_name || 'Usuario',
          author_username: post.users?.username || 'usuario',
          author_avatar: post.users?.avatar_url || '',
          restaurant_name: post.restaurants?.name || undefined,
          is_shared: false
        };

        combined.push({
          type: 'post',
          data: processedPost,
          created_at: post.created_at,
          id: `post-${post.id}`
        });
      }
    }

    // Obtener posts compartidos del usuario con paginación
    const { data: sharedPostsData, error: sharedPostsError } = await supabase
      .from('shared_posts')
      .select(`
        id,
        created_at,
        comment,
        shared_type,
        sharer_id,
        shared_post_id,
        shared_recipe_id,
        shared_restaurant_id,
        users!shared_posts_sharer_id_fkey (
          id,
          full_name,
          username,
          avatar_url
        )
      `)
      .eq('sharer_id', targetUserId)
      .order('created_at', { ascending: false })
      .range(pageParam * postsPerPage, (pageParam + 1) * postsPerPage - 1);

    if (sharedPostsError) {
      console.error('❌ useUserFeedPaginated: Error fetching shared posts:', sharedPostsError);
      throw sharedPostsError;
    }

    // Procesar posts compartidos
    if (sharedPostsData) {
      for (const sharedPost of sharedPostsData) {
        let originalContent = null;

        // Obtener contenido original según el tipo
        if (sharedPost.shared_type === 'post' && sharedPost.shared_post_id) {
          const { data: originalPost } = await supabase
            .from('posts')
            .select(`
              *,
              users!posts_author_id_fkey (
                id,
                full_name,
                username,
                avatar_url
              )
            `)
            .eq('id', sharedPost.shared_post_id)
            .single();

          if (originalPost) {
            originalContent = {
              ...originalPost,
              author: originalPost.users
            };
          }
        } else if (sharedPost.shared_type === 'recipe' && sharedPost.shared_recipe_id) {
          const { data: originalRecipe } = await supabase
            .from('recipes')
            .select(`
              *,
              users!recipes_author_id_fkey (
                id,
                full_name,
                username,
                avatar_url
              )
            `)
            .eq('id', sharedPost.shared_recipe_id)
            .single();

          if (originalRecipe) {
            originalContent = {
              ...originalRecipe,
              author: originalRecipe.users
            };
          }
        } else if (sharedPost.shared_type === 'restaurant' && sharedPost.shared_restaurant_id) {
          const { data: originalRestaurant } = await supabase
            .from('restaurants')
            .select('*')
            .eq('id', sharedPost.shared_restaurant_id)
            .single();

          if (originalRestaurant) {
            originalContent = originalRestaurant;
          }
        }

        const processedSharedPost: SharedPost = {
          id: sharedPost.id,
          created_at: sharedPost.created_at,
          comment: sharedPost.comment,
          shared_type: sharedPost.shared_type as 'post' | 'recipe' | 'restaurant',
          sharer_id: sharedPost.sharer_id,
          shared_post_id: sharedPost.shared_post_id,
          shared_recipe_id: sharedPost.shared_recipe_id,
          shared_restaurant_id: sharedPost.shared_restaurant_id,
          sharer: sharedPost.users ? {
            id: sharedPost.users.id,
            full_name: sharedPost.users.full_name,
            username: sharedPost.users.username,
            avatar_url: sharedPost.users.avatar_url
          } : null,
          original_content: originalContent
        };

        combined.push({
          type: 'shared_post',
          data: processedSharedPost,
          created_at: sharedPost.created_at,
          id: `shared-${sharedPost.id}`
        });
      }
    }

    // Ordenar por fecha de creación (más reciente primero)
    combined.sort((a, b) => {
      try {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
      } catch (error) {
        console.warn('⚠️ useUserFeedPaginated: Error sorting dates:', error);
        return 0;
      }
    });

    console.log('✅ useUserFeedPaginated: Page', pageParam, 'obtenida:', combined.length, 'items');
    return combined;
  }, [targetUserId, postsPerPage]);

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
    queryKey: ['userFeed', targetUserId],
    queryFn: fetchUserFeedPage,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < postsPerPage) {
        return undefined;
      }
      
      const nextPage = allPages.length;
      console.log('➡️ useUserFeedPaginated: Siguiente página disponible:', nextPage);
      return nextPage;
    },
    enabled: !!targetUserId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  const combinedFeed = useMemo(() => {
    return data?.pages?.flat() || [];
  }, [data]);

  const loadMorePosts = useCallback(async () => {
    if (hasNextPage && !isFetchingNextPage) {
      console.log('📄 useUserFeedPaginated: Cargando más posts...');
      await fetchNextPage();
    } else {
      console.warn('⚠️ useUserFeedPaginated: No hay más posts para cargar o ya se está cargando...');
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const refreshFeed = useCallback(async () => {
    console.log('🔄 useUserFeedPaginated: Refresh manual solicitado...');
    setManualLoading(true);
    
    try {
      await refetch();
      console.log('✅ useUserFeedPaginated: Feed refresh completado');
    } catch (error) {
      console.error('❌ useUserFeedPaginated: Error en refresh:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el feed",
        variant: "destructive"
      });
    } finally {
      setManualLoading(false);
    }
  }, [refetch, toast]);

  // Calcular estadísticas
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
    loading: isLoading || manualLoading,
    hasMore: !!hasNextPage,
    isFetchingNextPage,
    loadMorePosts,
    refreshFeed,
    isEmpty: Array.isArray(combinedFeed) && combinedFeed.length === 0 && !isLoading,
    postsCount: stats.postsCount,
    sharedPostsCount: stats.sharedPostsCount,
    error,
    isError
  };
};
