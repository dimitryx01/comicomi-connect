import { useCallback } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Post {
  id: string;
  author_id: string;
  created_at: string;
  content: string;
  location?: string;
  restaurant_id?: string;
  recipe_id?: string;
  media_urls?: {
    images?: string[];
    videos?: string[];
  };
  cheers_count: number;
  comments_count: number;
  author_name: string;
  author_username: string;
  author_avatar: string;
  restaurant_name?: string;
  is_shared?: boolean;
  shared_data?: any;
}

interface UsePostsOptions {
  initialPageParam?: number;
  postsPerPage?: number;
}

export const usePosts = (options?: UsePostsOptions) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const initialPageParam = options?.initialPageParam || 0;
  const postsPerPage = options?.postsPerPage || 5;

  const fetchPosts = useCallback(async ({ pageParam = initialPageParam }) => {
    console.log('🔥 usePosts: Fetching posts...', { pageParam, postsPerPage });

    // Obtener posts normales
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
      .order('created_at', { ascending: false })
      .range(pageParam * postsPerPage, (pageParam + 1) * postsPerPage - 1);

    if (postsError) {
      console.error('❌ usePosts: Error fetching posts:', postsError);
      throw postsError;
    }

    // Obtener publicaciones compartidas con mejor estructura
    const { data: sharedPostsData, error: sharedError } = await supabase
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
          full_name,
          username,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })
      .range(pageParam * postsPerPage, (pageParam + 1) * postsPerPage - 1);

    if (sharedError) {
      console.warn('⚠️ usePosts: Error fetching shared posts:', sharedError);
    }

    // Procesar posts normales
    const processedPosts = await Promise.all(
      (postsData || []).map(async (post: any) => {
        const { count: cheersCount } = await supabase
          .from('cheers')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);

        const { count: commentsCount } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);

        return {
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
        } as Post;
      })
    );

    // Procesar publicaciones compartidas con contenido original completo
    const processedSharedPosts = !sharedError && sharedPostsData ? await Promise.all(
      sharedPostsData.map(async (sharedPost: any) => {
        console.log('🔄 usePosts: Procesando publicación compartida:', {
          id: sharedPost.id,
          sharedType: sharedPost.shared_type,
          sharerId: sharedPost.sharer_id
        });

        // Get cheers count para la publicación compartida
        const { count: cheersCount } = await supabase
          .from('cheers')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', sharedPost.id);

        // Get comments count para la publicación compartida
        const { count: commentsCount } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', sharedPost.id);

        // Obtener contenido original con toda la información necesaria
        let originalContent = null;
        try {
          if (sharedPost.shared_type === 'post' && sharedPost.shared_post_id) {
            const { data } = await supabase
              .from('posts')
              .select(`
                *,
                users!posts_author_id_fkey(full_name, username, avatar_url),
                restaurants(name)
              `)
              .eq('id', sharedPost.shared_post_id)
              .single();
            originalContent = data;
          } else if (sharedPost.shared_type === 'recipe' && sharedPost.shared_recipe_id) {
            const { data } = await supabase
              .from('recipes')
              .select(`
                *,
                users!recipes_author_id_fkey(full_name, username, avatar_url)
              `)
              .eq('id', sharedPost.shared_recipe_id)
              .single();
            originalContent = data;
          } else if (sharedPost.shared_type === 'restaurant' && sharedPost.shared_restaurant_id) {
            const { data } = await supabase
              .from('restaurants')
              .select('*')
              .eq('id', sharedPost.shared_restaurant_id)
              .single();
            originalContent = data;
          }
        } catch (error) {
          console.warn('⚠️ usePosts: Error obteniendo contenido original:', error);
        }

        return {
          id: sharedPost.id,
          author_id: sharedPost.sharer_id,
          created_at: sharedPost.created_at,
          content: sharedPost.comment || '',
          cheers_count: cheersCount || 0,
          comments_count: commentsCount || 0,
          author_name: sharedPost.users?.full_name || 'Usuario',
          author_username: sharedPost.users?.username || 'usuario',
          author_avatar: sharedPost.users?.avatar_url || '',
          is_shared: true,
          shared_data: {
            shared_type: sharedPost.shared_type,
            shared_post_id: sharedPost.shared_post_id,
            shared_recipe_id: sharedPost.shared_recipe_id,
            shared_restaurant_id: sharedPost.shared_restaurant_id,
            original_content: originalContent
          }
        } as Post;
      })
    ) : [];

    // Combinar y ordenar por fecha
    const allPosts = [...processedPosts, ...processedSharedPosts]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    console.log('✅ usePosts: Posts fetched successfully', { 
      normalPosts: processedPosts.length,
      sharedPosts: processedSharedPosts.length,
      total: allPosts.length
    });
    
    return allPosts;
  }, [postsPerPage, initialPageParam]);

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
    queryKey: ['posts'],
    queryFn: fetchPosts,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < postsPerPage) {
        return undefined;
      }
      
      const nextPage = allPages.length;
      console.log('➡️ usePosts: Obteniendo la siguiente página...', { nextPage });
      return nextPage;
    },
  });

  const posts = data?.pages?.flat() || [];
  const hasMore = !!hasNextPage;

  const totalCount = (() => {
    return 100;
  })();

  const loadMorePosts = async () => {
    if (hasNextPage && !isFetchingNextPage) {
      console.log('📄 usePosts: Cargando más posts...');
      await fetchNextPage();
    } else {
      console.warn('⚠️ usePosts: No hay más posts para cargar o ya se está cargando...');
    }
  };

  const createPost = useCallback(async (
    content: string,
    location?: string,
    restaurantId?: string,
    recipeId?: string,
    mediaUrls?: { images?: string[]; videos?: string[] }
  ) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para crear posts",
        variant: "destructive"
      });
      return false;
    }

    try {
      console.log('📝 usePosts: Creando post...', { content, location, restaurantId, recipeId, mediaUrls });

      const { error } = await supabase
        .from('posts')
        .insert({
          author_id: user.id,
          content,
          location,
          restaurant_id: restaurantId,
          recipe_id: recipeId,
          media_urls: mediaUrls
        });

      if (error) {
        console.error('❌ usePosts: Error creando post:', error);
        throw error;
      }

      console.log('✅ usePosts: Post creado exitosamente');
      
      toast({
        title: "Post creado",
        description: "El post se ha publicado correctamente",
      });

      await queryClient.invalidateQueries({ queryKey: ['posts'] });
      
      return true;
    } catch (error) {
      console.error('❌ usePosts: Error creando post:', error);
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo crear el post",
        variant: "destructive"
      });
      
      return false;
    }
  }, [user, toast, queryClient]);

  const updatePost = useCallback(async (
    postId: string, 
    content: string, 
    location?: string,
    mediaUrls?: { images?: string[]; videos?: string[] }
  ) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para actualizar posts",
        variant: "destructive"
      });
      return false;
    }

    try {
      console.log('✏️ usePosts: Actualizando post:', postId);

      const { error } = await supabase
        .from('posts')
        .update({
          content,
          location,
          media_urls: mediaUrls,
          updated_at: new Date().toISOString()
        })
        .eq('id', postId)
        .eq('author_id', user.id);

      if (error) {
        console.error('❌ usePosts: Error actualizando post:', error);
        throw error;
      }

      console.log('✅ usePosts: Post actualizado exitosamente');
      
      toast({
        title: "Post actualizado",
        description: "Los cambios se han guardado correctamente",
      });

      if (posts.length > 0) {
        await refetch();
      }
      
      return true;
    } catch (error) {
      console.error('❌ usePosts: Error actualizando post:', error);
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo actualizar el post",
        variant: "destructive"
      });
      
      return false;
    }
  }, [user, toast, posts.length, refetch]);

  return {
    posts,
    loading: isLoading,
    hasMore,
    totalCount,
    postsPerPage,
    loadMorePosts,
    createPost,
    updatePost,
    refreshPosts: refetch,
    error,
    isError,
    isFetchingNextPage
  };
};
