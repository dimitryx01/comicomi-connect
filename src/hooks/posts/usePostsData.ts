
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Post } from '@/types/post';

export const usePostsData = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const processPost = useCallback(async (post: any) => {
    console.log('🔄 usePostsData: Procesando post:', {
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

    console.log('✅ usePostsData: Post procesado:', {
      postId: processedPost.id,
      authorName: processedPost.author_name,
      avatarFileId: processedPost.author_avatar,
      hasAvatar: !!processedPost.author_avatar
    });

    return processedPost;
  }, []);

  const fetchPostsFromDB = useCallback(async (offset: number, limit: number) => {
    console.log('📡 usePostsData: Fetching posts from DB:', { offset, limit });

    // First get total count
    const { count: totalPostsCount, error: countError } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('is_public', true);

    if (countError) {
      console.error('❌ usePostsData: Error fetching posts count:', countError);
      throw countError;
    }

    console.log('📊 usePostsData: Total posts count:', totalPostsCount);

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
      .range(offset, offset + limit - 1);

    if (postsError) {
      console.error('❌ usePostsData: Error fetching posts:', postsError);
      throw postsError;
    }

    console.log('📊 usePostsData: Posts data received:', {
      postsCount: postsData?.length || 0,
      offset,
      samplePost: postsData?.[0] ? {
        id: postsData[0].id,
        authorData: postsData[0].users,
        avatarUrl: postsData[0].users?.avatar_url
      } : null
    });

    // Process posts with counts
    const processedPosts = await Promise.all((postsData || []).map(processPost));

    return { posts: processedPosts, totalCount: totalPostsCount || 0 };
  }, [processPost]);

  const updatePosts = useCallback((newPosts: Post[], append: boolean = false) => {
    if (append) {
      setPosts(prevPosts => {
        console.log('📚 usePostsData: Posts agregados a la lista existente', {
          prevCount: prevPosts.length,
          newCount: newPosts.length,
          totalAfter: prevPosts.length + newPosts.length
        });
        return [...prevPosts, ...newPosts];
      });
    } else {
      setPosts(newPosts);
      console.log('🔄 usePostsData: Posts reemplazados en la lista', {
        newCount: newPosts.length
      });
    }
  }, []);

  const addPostToTop = useCallback((newPost: Post) => {
    setPosts(prevPosts => {
      // Verificar si el post ya existe para evitar duplicados
      const postExists = prevPosts.some(post => post.id === newPost.id);
      if (postExists) {
        console.log('⚠️ usePostsData: Post ya existe, evitando duplicado');
        return prevPosts;
      }
      
      console.log('🔝 usePostsData: Agregando nuevo post al inicio de la lista', {
        postId: newPost.id,
        authorName: newPost.author_name,
        hasAvatar: !!newPost.author_avatar,
        hasMedia: !!(newPost.media_urls?.images?.length || newPost.media_urls?.videos?.length),
        prevCount: prevPosts.length,
        newCount: prevPosts.length + 1
      });
      
      // Crear un nuevo array con el post al inicio
      const updatedPosts = [newPost, ...prevPosts];
      return updatedPosts;
    });
  }, []);

  const removePostOptimistically = useCallback((postId: string) => {
    console.log('⚡ usePostsData: Eliminando post del feed optimísticamente:', postId);
    
    setPosts(prevPosts => {
      const updatedPosts = prevPosts.filter(post => post.id !== postId);
      console.log('📊 usePostsData: Posts actualizados tras eliminación:', {
        antes: prevPosts.length,
        después: updatedPosts.length,
        postEliminado: postId
      });
      return updatedPosts;
    });
  }, []);

  const showError = useCallback((message: string) => {
    toast({
      title: "Error",
      description: message,
      variant: "destructive"
    });
  }, [toast]);

  return {
    posts,
    loading,
    setLoading,
    fetchPostsFromDB,
    updatePosts,
    addPostToTop,
    removePostOptimistically,
    showError
  };
};
