
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface SavedPost {
  id: string;
  content: string;
  created_at: string;
  author?: {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string;
  };
  media_urls: any[];
  cheers_count: number;
  comments_count: number;
  saves_count: number;
  shares_count: number;
  has_user_cheered: boolean;
  has_user_saved: boolean;
  restaurant?: any;
  recipe?: any;
}

export const useSavedPosts = () => {
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchSavedPosts = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('🔍 useSavedPosts: Obteniendo posts guardados');
      
      const { data, error } = await supabase
        .from('saved_posts')
        .select(`
          post_id,
          created_at,
          posts (
            id,
            content,
            created_at,
            media_urls,
            author_id,
            users!posts_author_id_fkey (
              id,
              full_name,
              username,
              avatar_url
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedPosts = (data || []).map((item: any) => ({
        id: item.posts.id,
        content: item.posts.content,
        created_at: item.posts.created_at,
        author: {
          id: item.posts.users?.id || '',
          full_name: item.posts.users?.full_name || 'Usuario',
          username: item.posts.users?.username || '',
          avatar_url: item.posts.users?.avatar_url || ''
        },
        media_urls: item.posts.media_urls || [],
        cheers_count: 0,
        comments_count: 0,
        saves_count: 0,
        shares_count: 0,
        has_user_cheered: false,
        has_user_saved: true,
        restaurant: null,
        recipe: null
      }));

      setSavedPosts(transformedPosts);
      console.log('✅ useSavedPosts: Posts guardados obtenidos:', transformedPosts.length);
    } catch (error) {
      console.error('❌ useSavedPosts: Error obteniendo posts guardados:', error);
      setSavedPosts([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchSavedPosts();
    }
  }, [fetchSavedPosts]);

  const savePost = useCallback(async (postId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para guardar posts",
        variant: "destructive"
      });
      return false;
    }

    try {
      console.log('💾 useSavedPosts: Guardando post:', postId);

      const { error } = await supabase
        .from('saved_posts')
        .insert({
          user_id: user.id,
          post_id: postId
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          console.log('📝 useSavedPosts: Post ya guardado, no se muestra error al usuario');
          return true; // Tratamos como éxito si ya está guardado
        }
        throw error;
      }

      console.log('✅ useSavedPosts: Post guardado exitosamente');
      toast({
        title: "Post guardado",
        description: "Post agregado a guardados",
      });
      await fetchSavedPosts(); // Refresh the list
      return true;
    } catch (error) {
      console.error('❌ useSavedPosts: Error guardando post:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el post",
        variant: "destructive"
      });
      return false;
    }
  }, [user, fetchSavedPosts, toast]);

  const unsavePost = useCallback(async (postId: string) => {
    if (!user) return false;

    try {
      console.log('🗑️ useSavedPosts: Eliminando post de favoritos:', postId);

      const { error } = await supabase
        .from('saved_posts')
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', postId);

      if (error) throw error;

      console.log('✅ useSavedPosts: Post eliminado de favoritos');
      toast({
        title: "Post eliminado",
        description: "Post eliminado de guardados",
      });
      await fetchSavedPosts(); // Refresh the list
      return true;
    } catch (error) {
      console.error('❌ useSavedPosts: Error eliminando post de favoritos:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar de favoritos",
        variant: "destructive"
      });
      return false;
    }
  }, [user, fetchSavedPosts, toast]);

  const toggleSave = useCallback(async (postId: string) => {
    const isCurrentlySaved = isSaved(postId);
    if (isCurrentlySaved) {
      return await unsavePost(postId);
    } else {
      return await savePost(postId);
    }
  }, [savePost, unsavePost]);

  const isSaved = useCallback((postId: string) => {
    return savedPosts.some(saved => saved.id === postId);
  }, [savedPosts]);

  return {
    savedPosts,
    savePost,
    unsavePost,
    toggleSave,
    isSaved,
    loading
  };
};
