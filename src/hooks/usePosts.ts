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

    let query = supabase
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
        cheers_count,
        comments_count,
        author_name: profiles (name),
        author_username: profiles (username),
        author_avatar: profiles (avatar),
        restaurant_name: restaurants (name)
      `)
      .order('created_at', { ascending: false })
      .range(pageParam * postsPerPage, (pageParam + 1) * postsPerPage - 1);

    const { data, error } = await query;

    if (error) {
      console.error('❌ usePosts: Error fetching posts:', error);
      throw error;
    }

    console.log('✅ usePosts: Posts fetched successfully', { fetched: data.length });
    return data as Post[];
  }, [postsPerPage]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch
  } = useInfiniteQuery(
    'posts',
    fetchPosts,
    {
      getNextPageParam: (lastPage, allPages) => {
        // Verificar si la última página está vacía
        if (lastPage.length < postsPerPage) {
          return undefined;
        }
        
        const nextPage = allPages.length;
        console.log('➡️ usePosts: Obteniendo la siguiente página...', { nextPage });
        return nextPage;
      },
    }
  );

  const posts = data?.pages?.flat() || [];
  const hasMore = !!hasNextPage;

  const totalCount = (() => {
    // TODO: Implementar conteo total desde la base de datos
    // Esto requiere una función separada en Supabase para contar los posts
    // o mantener un contador en la tabla de perfiles
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

      // Invalida la query para que se refresque la lista de posts
      await queryClient.invalidateQueries('posts');
      
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
        .eq('author_id', user.id); // Solo permitir actualizar posts propios

      if (error) {
        console.error('❌ usePosts: Error actualizando post:', error);
        throw error;
      }

      console.log('✅ usePosts: Post actualizado exitosamente');
      
      toast({
        title: "Post actualizado",
        description: "Los cambios se han guardado correctamente",
      });

      // Refrescar la lista de posts para mostrar los cambios
      if (data.length > 0) {
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
  }, [user, toast, data.length, refetch]);

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
