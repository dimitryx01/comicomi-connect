
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

export const usePostsWithoutAuth = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchPosts = async () => {
    try {
      setLoading(true);
      console.log('Fetching posts from database...');
      
      // Get posts with user info - sin filtro de autenticación
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          users!posts_author_id_fkey(full_name, username, avatar_url),
          restaurants(name)
        `)
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Error fetching posts:', postsError);
        throw postsError;
      }

      console.log('Posts data received:', postsData);

      // Get cheers and comments counts for each post
      const postsWithCounts = await Promise.all((postsData || []).map(async (post) => {
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

        return {
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
      }));

      console.log('Processed posts:', postsWithCounts);
      setPosts(postsWithCounts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los posts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return {
    posts,
    loading,
    refreshPosts: fetchPosts
  };
};
