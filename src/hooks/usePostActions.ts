
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const usePostActions = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const deletePost = useCallback(async (postId: string, authorId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado",
        variant: "destructive"
      });
      return false;
    }

    if (user.id !== authorId) {
      toast({
        title: "Error",
        description: "Solo puedes eliminar tus propios posts",
        variant: "destructive"
      });
      return false;
    }

    try {
      console.log('🗑️ usePostActions: Eliminando post:', postId);

      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('author_id', user.id); // Extra security check

      if (error) throw error;

      console.log('✅ usePostActions: Post eliminado exitosamente');
      toast({
        title: "Post eliminado",
        description: "El post se ha eliminado correctamente",
      });
      return true;
    } catch (error) {
      console.error('❌ usePostActions: Error eliminando post:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el post",
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast]);

  const reportPost = useCallback(async (postId: string, reportType: string = 'inappropriate_content') => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para reportar",
        variant: "destructive"
      });
      return false;
    }

    try {
      console.log('🚩 usePostActions: Reportando post:', postId);

      const { error } = await supabase
        .from('reports')
        .insert({
          reporter_id: user.id,
          post_id: postId,
          report_type: reportType,
          status: 'pending'
        });

      if (error) throw error;

      console.log('✅ usePostActions: Post reportado exitosamente');
      return true;
    } catch (error) {
      console.error('❌ usePostActions: Error reportando post:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar el reporte",
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast]);

  return {
    deletePost,
    reportPost
  };
};
