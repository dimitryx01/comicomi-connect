
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Post {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  author_name: string;
  author_username: string;
  author_avatar: string;
  media_urls: any;
  location: string;
  restaurant_id: string;
  restaurant_name: string;
  cheers_count: number;
  comments_count: number;
}

interface PaginatedPostsResponse {
  posts: Post[];
  totalCount: number;
  hasMore: boolean;
}

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const POSTS_PER_PAGE = 10;

  const fetchPosts = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      console.log('📡 usePosts: Iniciando fetch de posts paginados:', {
        page,
        postsPerPage: POSTS_PER_PAGE,
        append,
        offset: (page - 1) * POSTS_PER_PAGE
      });
      
      // First get total count
      const { count: totalPostsCount, error: countError } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('is_public', true);

      if (countError) {
        console.error('❌ usePosts: Error fetching posts count:', countError);
        throw countError;
      }

      console.log('📊 usePosts: Total posts count:', totalPostsCount);
      setTotalCount(totalPostsCount || 0);

      // Calculate pagination
      const offset = (page - 1) * POSTS_PER_PAGE;
      const hasMorePosts = totalPostsCount ? offset + POSTS_PER_PAGE < totalPostsCount : false;
      setHasMore(hasMorePosts);

      console.log('📄 usePosts: Calculaciones de paginación:', {
        offset,
        hasMore: hasMorePosts,
        totalPages: Math.ceil((totalPostsCount || 0) / POSTS_PER_PAGE)
      });

      // Get posts with pagination
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          users!posts_author_id_fkey(full_name, username, avatar_url),
          restaurants(name)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + POSTS_PER_PAGE - 1);

      if (postsError) {
        console.error('❌ usePosts: Error fetching posts:', postsError);
        throw postsError;
      }

      console.log('📊 usePosts: Posts data recibida desde Supabase:', {
        postsCount: postsData?.length || 0,
        page,
        offset,
        samplePost: postsData?.[0] ? {
          id: postsData[0].id,
          authorData: postsData[0].users,
          avatarUrl: postsData[0].users?.avatar_url
        } : null
      });

      // Get cheers and comments counts for each post
      const postsWithCounts = await Promise.all((postsData || []).map(async (post) => {
        console.log('🔄 usePosts: Procesando post:', {
          postId: post.id,
          authorData: post.users,
          avatarFileId: post.users?.avatar_url
        });

        // Get cheers count
        const { count: cheersCount } = await supabase
          .from('cheers')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);

        // Get comments count
        const { count: commentsCount } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);

        const processedPost = {
          id: post.id,
          content: post.content,
          created_at: post.created_at,
          author_id: post.author_id,
          author_name: post.users?.full_name || 'Usuario',
          author_username: post.users?.username || 'usuario',
          author_avatar: post.users?.avatar_url || '',
          media_urls: post.media_urls,
          location: post.location,
          restaurant_id: post.restaurant_id,
          restaurant_name: post.restaurants?.name || '',
          cheers_count: cheersCount || 0,
          comments_count: commentsCount || 0
        };

        console.log('✅ usePosts: Post procesado:', {
          postId: processedPost.id,
          authorName: processedPost.author_name,
          avatarFileId: processedPost.author_avatar,
          hasAvatar: !!processedPost.author_avatar
        });

        return processedPost;
      }));

      console.log('🎉 usePosts: Posts procesados exitosamente para página:', {
        page,
        totalPosts: postsWithCounts.length,
        postsWithAvatars: postsWithCounts.filter(p => p.author_avatar).length,
        append
      });
      
      if (append) {
        setPosts(prevPosts => [...prevPosts, ...postsWithCounts]);
        console.log('📚 usePosts: Posts agregados a la lista existente');
      } else {
        setPosts(postsWithCounts);
        console.log('🔄 usePosts: Posts reemplazados en la lista');
      }
    } catch (error) {
      console.error('💥 usePosts: Error crítico fetching posts:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los posts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const loadMorePosts = useCallback(async () => {
    if (!hasMore || loading) {
      console.log('⚠️ usePosts: No hay más posts para cargar o ya está cargando');
      return;
    }
    
    const nextPage = currentPage + 1;
    console.log('📄 usePosts: Cargando página siguiente:', nextPage);
    setCurrentPage(nextPage);
    await fetchPosts(nextPage, true);
  }, [currentPage, hasMore, loading, fetchPosts]);

  // Create new post
  const createPost = async (content: string, location?: string, restaurantId?: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para publicar",
        variant: "destructive"
      });
      return false;
    }

    try {
      setLoading(true);
      console.log('📝 usePosts: Creando nuevo post para usuario:', user.id);
      
      const { error } = await supabase
        .from('posts')
        .insert({
          content: content.trim(),
          author_id: user.id,
          location: location || null,
          restaurant_id: restaurantId || null,
          is_public: true
        });

      if (error) throw error;

      toast({
        title: "¡Éxito!",
        description: "Post publicado correctamente",
      });

      // Reset pagination and refresh posts after creating
      setCurrentPage(1);
      setHasMore(true);
      await fetchPosts(1, false);
      return true;
    } catch (error) {
      console.error('❌ usePosts: Error creating post:', error);
      toast({
        title: "Error",
        description: "No se pudo publicar el post",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscription and initial load
  useEffect(() => {
    console.log('🔔 usePosts: Configurando suscripción en tiempo real y carga inicial...');
    fetchPosts(1, false);

    // Subscribe to real-time changes
    const channel = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          console.log('📨 usePosts: Cambio en tiempo real detectado:', payload);
          // Only refresh if we're on the first page to avoid disrupting pagination
          if (currentPage === 1) {
            fetchPosts(1, false);
          }
        }
      )
      .subscribe();

    return () => {
      console.log('🛑 usePosts: Limpiando suscripción...');
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    posts,
    loading,
    currentPage,
    totalCount,
    hasMore,
    postsPerPage: POSTS_PER_PAGE,
    createPost,
    loadMorePosts,
    refreshPosts: () => {
      setCurrentPage(1);
      setHasMore(true);
      fetchPosts(1, false);
    }
  };
};
