
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useCommentActions = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const deleteComment = async (commentId: string) => {
    try {
      setLoading(true);
      console.log('🗑️ useCommentActions: Eliminando comentario:', commentId);
      
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) {
        console.error('❌ useCommentActions: Error eliminando comentario:', error);
        throw error;
      }

      console.log('✅ useCommentActions: Comentario eliminado exitosamente');
      toast({
        title: "Comentario eliminado",
        description: "El comentario se ha eliminado correctamente",
      });

      return true;
    } catch (error) {
      console.error('❌ useCommentActions: Error eliminando comentario:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el comentario",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const editComment = async (commentId: string, newContent: string) => {
    try {
      setLoading(true);
      console.log('✏️ useCommentActions: Editando comentario:', commentId);
      
      const { error } = await supabase
        .from('comments')
        .update({
          content: newContent.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId);

      if (error) {
        console.error('❌ useCommentActions: Error editando comentario:', error);
        throw error;
      }

      console.log('✅ useCommentActions: Comentario editado exitosamente');
      toast({
        title: "Comentario actualizado",
        description: "Los cambios se han guardado correctamente",
      });

      return true;
    } catch (error) {
      console.error('❌ useCommentActions: Error editando comentario:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el comentario",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const reportComment = async (commentId: string, reason: string = 'Contenido inapropiado') => {
    try {
      setLoading(true);
      console.log('🚩 useCommentActions: Reportando comentario:', commentId);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "Debes estar autenticado para reportar",
          variant: "destructive"
        });
        return false;
      }

      const { error } = await supabase
        .from('reports')
        .insert({
          reporter_id: user.id,
          comment_id: commentId,
          report_type: 'comment',
          description: reason,
          status: 'pending'
        });

      if (error) {
        console.error('❌ useCommentActions: Error reportando comentario:', error);
        throw error;
      }

      console.log('✅ useCommentActions: Comentario reportado exitosamente');
      toast({
        title: "Reporte enviado",
        description: "Hemos recibido tu reporte y lo revisaremos pronto",
      });

      return true;
    } catch (error) {
      console.error('❌ useCommentActions: Error reportando comentario:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar el reporte",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteComment,
    editComment,
    reportComment,
    loading
  };
};
