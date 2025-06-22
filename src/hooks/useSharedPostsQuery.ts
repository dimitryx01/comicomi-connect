
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { SharedPost } from '@/types/sharedPost';

interface UseSharedPostsQueryOptions {
  pageSize?: number;
}

export const useSharedPostsQuery = (options?: UseSharedPostsQueryOptions) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const pageSize = options?.pageSize || 5;

  const fetchSharedPosts = async ({ pageParam = 0 }) => {
    console.log('🔄 useSharedPostsQuery: Obteniendo publicaciones compartidas...', { pageParam, pageSize });

    // Obtener publicaciones compartidas con información del usuario que comparte
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
      console.error('❌ useSharedPostsQuery: Error obteniendo publicaciones compartidas:', sharedError);
      throw sharedError;
    }

    // Procesar publicaciones compartidas con contenido original completo
    const processedSharedPosts = await Promise.all(
      (sharedPostsData || []).map(async (sharedPost: any) => {
        console.log('🔄 useSharedPostsQuery: Procesando publicación compartida:', {
          id: sharedPost.id,
          sharedType: sharedPost.shared_type,
          sharerId: sharedPost.sharer_id
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

        // Obtener contenido original con toda la información necesaria
        let originalContent = null;
        try {
          if (sharedPost.shared_type === 'post' && sharedPost.shared_post_id) {
            console.log('📝 useSharedPostsQuery: Obteniendo post original:', sharedPost.shared_post_id);
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
              .single();
            
            if (data) {
              console.log('✅ useSharedPostsQuery: Post original obtenido:', {
                id: data.id,
                hasMediaUrls: !!data.media_urls,
                mediaUrls: data.media_urls,
                authorName: data.users?.full_name
              });

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
            console.log('🍳 useSharedPostsQuery: Obteniendo receta original:', sharedPost.shared_recipe_id);
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
              .single();
            
            if (data) {
              console.log('✅ useSharedPostsQuery: Receta original obtenida:', {
                id: data.id,
                title: data.title,
                hasImage: !!data.image_url,
                image_url: data.image_url,
                authorName: data.users?.full_name
              });

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
            console.log('🏪 useSharedPostsQuery: Obteniendo restaurante original:', sharedPost.shared_restaurant_id);
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
              console.log('✅ useSharedPostsQuery: Restaurante original obtenido:', {
                id: data.id,
                name: data.name,
                hasImage: !!(data.image_url || data.cover_image_url),
                image_url: data.image_url,
                cover_image_url: data.cover_image_url
              });

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
          console.warn('⚠️ useSharedPostsQuery: Error obteniendo contenido original:', error);
        }

        const processedPost: SharedPost = {
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

        console.log('✅ useSharedPostsQuery: Publicación compartida procesada:', {
          id: processedPost.id,
          hasOriginalContent: !!processedPost.original_content,
          originalContentType: processedPost.shared_type
        });

        return processedPost;
      })
    );

    console.log('✅ useSharedPostsQuery: Publicaciones compartidas procesadas:', {
      count: processedSharedPosts.length,
      pageParam
    });

    return processedSharedPosts;
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    is

ading,
    isError,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey: ['shared-posts'],
    queryFn: fetchSharedPosts,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < pageSize) {
        return undefined;
      }
      return allPages.length;
    },
  });

  const sharedPosts = data?.pages?.flat() || [];

  return {
    sharedPosts,
    loading: isLoading,
    hasMore: !!hasNextPage,
    loadMore: fetchNextPage,
    isFetchingMore: isFetchingNextPage,
    refetch,
    error,
    isError
  };
};
