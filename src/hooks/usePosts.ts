
import { useCallback, useEffect, useRef } from 'react';
import { usePostsPagination } from './posts/usePostsPagination';
import { usePostsData } from './posts/usePostsData';
import { usePostCreation } from './posts/usePostCreation';
import { usePostsRealtime } from './posts/usePostsRealtime';
import { Post } from '@/types/post';

export const usePosts = () => {
  const POSTS_PER_PAGE = 10;
  const isInitializedRef = useRef(false);

  const {
    currentPage,
    totalCount,
    hasMore,
    resetPagination,
    calculatePagination,
    goToNextPage
  } = usePostsPagination(POSTS_PER_PAGE);

  const {
    posts,
    loading,
    setLoading,
    fetchPostsFromDB,
    updatePosts,
    addPostToTop,
    showError
  } = usePostsData();

  const { createPost: createPostHandler } = usePostCreation();

  const fetchPosts = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      console.log('📡 usePosts: Iniciando fetch de posts paginados:', {
        page,
        postsPerPage: POSTS_PER_PAGE,
        append,
        offset: (page - 1) * POSTS_PER_PAGE
      });

      const offset = (page - 1) * POSTS_PER_PAGE;
      const { posts: fetchedPosts, totalCount } = await fetchPostsFromDB(offset, POSTS_PER_PAGE);
      
      calculatePagination(totalCount, page);

      console.log('🎉 usePosts: Posts procesados exitosamente para página:', {
        page,
        totalPosts: fetchedPosts.length,
        postsWithAvatars: fetchedPosts.filter(p => p.author_avatar).length,
        append
      });
      
      updatePosts(fetchedPosts, append);
    } catch (error) {
      console.error('💥 usePosts: Error crítico fetching posts:', error);
      showError("No se pudieron cargar los posts");
    } finally {
      setLoading(false);
    }
  }, [setLoading, fetchPostsFromDB, calculatePagination, updatePosts, showError]);

  const loadMorePosts = useCallback(async () => {
    if (!hasMore || loading) {
      console.log('⚠️ usePosts: No hay más posts para cargar o ya está cargando');
      return;
    }
    
    const nextPage = currentPage + 1;
    console.log('📄 usePosts: Cargando página siguiente:', nextPage);
    goToNextPage();
    await fetchPosts(nextPage, true);
  }, [currentPage, hasMore, loading, fetchPosts, goToNextPage]);

  const refreshPosts = useCallback(() => {
    console.log('🔄 usePosts: Refrescando posts...');
    resetPagination();
    fetchPosts(1, false);
  }, [resetPagination, fetchPosts]);

  // Obtener la función para marcar actualizaciones optimistas
  const { markOptimisticUpdate } = usePostsRealtime(currentPage, refreshPosts);

  const createPost = useCallback(async (
    content: string, 
    location?: string, 
    restaurantId?: string, 
    recipeId?: string,
    mediaUrls?: { images?: string[]; videos?: string[] } | null
  ) => {
    console.log('📝 usePosts: Iniciando creación de post...');
    
    const success = await createPostHandler(content, location, restaurantId, recipeId, mediaUrls, (newPost: Post) => {
      console.log('✅ usePosts: Post creado exitosamente, agregando al feed inmediatamente...');
      // Marcar que hicimos una actualización optimista
      markOptimisticUpdate();
      // Actualización optimista: agregar el post al inicio de la lista inmediatamente
      addPostToTop(newPost);
      // También incrementar el totalCount para la paginación
      calculatePagination(totalCount + 1, currentPage);
    });
    
    return success;
  }, [createPostHandler, addPostToTop, calculatePagination, totalCount, currentPage, markOptimisticUpdate]);

  // Inicialización única y suscripción en tiempo real
  useEffect(() => {
    if (!isInitializedRef.current) {
      console.log('🔔 usePosts: Configurando carga inicial única...');
      isInitializedRef.current = true;
      fetchPosts(1, false);
    }
  }, [fetchPosts]);

  return {
    posts,
    loading,
    currentPage,
    totalCount,
    hasMore,
    postsPerPage: POSTS_PER_PAGE,
    createPost,
    loadMorePosts,
    refreshPosts
  };
};
