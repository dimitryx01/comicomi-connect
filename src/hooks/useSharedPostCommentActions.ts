
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSharedPostCommentActions = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const deleteComment = async (commentId: string) => {
    try {
      setLoading(true);
      console.log('🗑️ useSharedPostCommentActions: Iniciando eliminación de comentario:', commentId);
      
      // Verificar autenticación
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ useSharedPostCommentActions: Usuario no autenticado');
        toast({
          title: "Error",
          description: "Debes estar autenticado para eliminar un comentario",
          variant: "destructive"
        });
        return false;
      }

      console.log('🔍 useSharedPostCommentActions: Usuario autenticado:', {
        userId: user.id,
        commentId: commentId,
        userIdType: typeof user.id,
        commentIdType: typeof commentId
      });

      // Verificar que el comentario existe para debugging
      console.log('🔍 useSharedPostCommentActions: Verificando si el comentario existe...');
      const { data: commentCheck, error: checkError } = await supabase
        .from('shared_post_comments')
        .select('id, user_id, content')
        .eq('id', commentId);

      if (checkError) {
        console.error('❌ useSharedPostCommentActions: Error verificando comentario:', checkError);
      } else {
        console.log('🔍 useSharedPostCommentActions: Comentarios encontrados:', commentCheck);
        if (commentCheck && commentCheck.length > 0) {
          const comment = commentCheck[0];
          console.log('🔍 useSharedPostCommentActions: Detalles del comentario:', {
            commentUserId: comment.user_id,
            currentUserId: user.id,
            idsMatch: String(comment.user_id) === String(user.id),
            commentUserIdType: typeof comment.user_id,
            currentUserIdType: typeof user.id
          });
        } else {
          console.log('❌ useSharedPostCommentActions: No se encontró ningún comentario con ese ID');
        }
      }

      // Eliminar con filtros específicos
      console.log('🔍 useSharedPostCommentActions: Ejecutando eliminación con filtros:', {
        commentId: commentId,
        userId: user.id
      });

      const { data: deleteData, error } = await supabase
        .from('shared_post_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id)
        .select();

      console.log('🔍 useSharedPostCommentActions: Resultado de eliminación:', {
        data: deleteData,
        error: error,
        deletedCount: deleteData?.length || 0
      });

      if (error) {
        console.error('❌ useSharedPostCommentActions: Error eliminando comentario:', {
          error: error,
          code: error.code,
          message: error.message,
          details: error.details
        });
        
        toast({
          title: "Error",
          description: `No se pudo eliminar el comentario: ${error.message}`,
          variant: "destructive"
        });
        return false;
      }

      // Verificar si se eliminó algún registro
      if (!deleteData || deleteData.length === 0) {
        console.error('❌ useSharedPostCommentActions: No se eliminó ningún comentario - posibles causas:');
        console.error('  - El comentario no existe');
        console.error('  - El comentario no pertenece al usuario actual');
        console.error('  - Problemas con las políticas RLS');
        
        toast({
          title: "Error",
          description: "No se encontró el comentario o no tienes permisos para eliminarlo",
          variant: "destructive"
        });
        return false;
      }

      console.log('✅ useSharedPostCommentActions: Comentario eliminado exitosamente:', deleteData);
      toast({
        title: "Comentario eliminado",
        description: "El comentario se ha eliminado correctamente",
      });

      return true;
    } catch (error) {
      console.error('❌ useSharedPostCommentActions: Error general eliminando comentario:', error);
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
      console.log('✏️ useSharedPostCommentActions: Iniciando edición de comentario:', { 
        commentId, 
        newContent: newContent.substring(0, 50) + '...' 
      });
      
      // Verificar autenticación
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ useSharedPostCommentActions: Usuario no autenticado');
        toast({
          title: "Error",
          description: "Debes estar autenticado para editar un comentario",
          variant: "destructive"
        });
        return false;
      }

      console.log('🔍 useSharedPostCommentActions: Usuario autenticado para edición:', {
        userId: user.id,
        commentId: commentId,
        userIdType: typeof user.id,
        commentIdType: typeof commentId
      });

      // Validar contenido
      if (!newContent || newContent.trim().length === 0) {
        console.error('❌ useSharedPostCommentActions: Contenido vacío');
        toast({
          title: "Error",
          description: "El comentario no puede estar vacío",
          variant: "destructive"
        });
        return false;
      }

      // Verificar que el comentario existe para debugging
      console.log('🔍 useSharedPostCommentActions: Verificando comentario antes de editar...');
      const { data: commentCheck, error: checkError } = await supabase
        .from('shared_post_comments')
        .select('id, user_id, content')
        .eq('id', commentId);

      if (checkError) {
        console.error('❌ useSharedPostCommentActions: Error verificando comentario para edición:', checkError);
      } else {
        console.log('🔍 useSharedPostCommentActions: Comentarios encontrados para edición:', commentCheck);
        if (commentCheck && commentCheck.length > 0) {
          const comment = commentCheck[0];
          console.log('🔍 useSharedPostCommentActions: Detalles del comentario a editar:', {
            commentUserId: comment.user_id,
            currentUserId: user.id,
            idsMatch: String(comment.user_id) === String(user.id),
            currentContent: comment.content,
            newContent: newContent.trim()
          });
        } else {
          console.log('❌ useSharedPostCommentActions: No se encontró comentario para editar');
        }
      }

      // Actualizar con filtros específicos
      console.log('🔍 useSharedPostCommentActions: Ejecutando actualización con filtros:', {
        commentId: commentId,
        userId: user.id,
        newContent: newContent.trim()
      });

      const { data, error } = await supabase
        .from('shared_post_comments')
        .update({
          content: newContent.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .eq('user_id', user.id)
        .select();

      console.log('🔍 useSharedPostCommentActions: Resultado de actualización:', {
        data: data,
        error: error,
        updatedCount: data?.length || 0
      });

      if (error) {
        console.error('❌ useSharedPostCommentActions: Error editando comentario:', {
          error: error,
          code: error.code,
          message: error.message,
          details: error.details
        });
        
        toast({
          title: "Error",
          description: `No se pudo actualizar el comentario: ${error.message}`,
          variant: "destructive"
        });
        return false;
      }

      // Verificar si se actualizó algún registro
      if (!data || data.length === 0) {
        console.error('❌ useSharedPostCommentActions: No se actualizó ningún comentario - posibles causas:');
        console.error('  - El comentario no existe');
        console.error('  - El comentario no pertenece al usuario actual');
        console.error('  - Problemas con las políticas RLS');
        
        toast({
          title: "Error",
          description: "No se encontró el comentario o no tienes permisos para editarlo",
          variant: "destructive"
        });
        return false;
      }

      console.log('✅ useSharedPostCommentActions: Comentario editado exitosamente:', data);
      toast({
        title: "Comentario actualizado",
        description: "Los cambios se han guardado correctamente",
      });

      return true;
    } catch (error) {
      console.error('❌ useSharedPostCommentActions: Error general editando comentario:', error);
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
      console.log('🚩 useSharedPostCommentActions: Iniciando reporte de comentario:', { commentId, reason });
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "Debes estar autenticado para reportar",
          variant: "destructive"
        });
        return false;
      }

      console.log('🔍 useSharedPostCommentActions: Usuario autenticado para reporte:', user.id);

      const { error } = await supabase
        .from('reports')
        .insert({
          reporter_id: user.id,
          comment_id: commentId,
          report_type: 'shared_post_comment',
          description: reason,
          status: 'pending'
        });

      if (error) {
        console.error('❌ useSharedPostCommentActions: Error reportando comentario:', error);
        throw error;
      }

      console.log('✅ useSharedPostCommentActions: Comentario reportado exitosamente');
      toast({
        title: "Reporte enviado",
        description: "Hemos recibido tu reporte y lo revisaremos pronto",
      });

      return true;
    } catch (error) {
      console.error('❌ useSharedPostCommentActions: Error reportando comentario:', error);
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
