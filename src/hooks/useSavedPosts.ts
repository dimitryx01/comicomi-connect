
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useSavedPosts = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

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
      setLoading(true);
      console.log('💾 useSavedPosts: Guardando post:', postId);

      const { error } = await supabase
        .from('saved_posts')
        .insert({
          user_id: user.id,
          post_id: postId
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Post ya guardado",
            description: "Este post ya está en tus favoritos",
            variant: "destructive"
          });
          return false;
        }
        throw error;
      }

      console.log('✅ useSavedPosts: Post guardado exitosamente');
      return true;
    } catch (error) {
      console.error('❌ useSavedPosts: Error guardando post:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el post",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const unsavePost = useCallback(async (postId: string) => {
    if (!user) return false;

    try {
      setLoading(true);
      console.log('🗑️ useSavedPosts: Eliminando post de favoritos:', postId);

      const { error } = await supabase
        .from('saved_posts')
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', postId);

      if (error) throw error;

      console.log('✅ useSavedPosts: Post eliminado de favoritos');
      return true;
    } catch (error) {
      console.error('❌ useSavedPosts: Error eliminando post de favoritos:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar de favoritos",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  return {
    savePost,
    unsavePost,
    loading
  };
};
