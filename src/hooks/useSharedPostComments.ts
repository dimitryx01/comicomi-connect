
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SharedPostComment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user_full_name: string;
  user_username: string;
  user_avatar_url: string;
  cheers_count: number;
}

export const useSharedPostComments = (sharedPostId: string) => {
  const [comments, setComments] = useState<SharedPostComment[]>([]);
  const [commentsCount, setCommentsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  // Fetch comments
  const fetchComments = async () => {
    try {
      console.log('💬 useSharedPostComments: Obteniendo comentarios para shared post:', sharedPostId);
      
      const { data, error } = await supabase.rpc('get_shared_post_comments', {
        shared_post_uuid: sharedPostId
      });

      if (error) {
        console.error('❌ useSharedPostComments: Error obteniendo comentarios:', error);
        throw error;
      }
      
      console.log('📝 useSharedPostComments: Comentarios obtenidos:', data?.length || 0);
      setComments(data || []);
      setCommentsCount(data?.length || 0);
    } catch (error) {
      console.error('❌ useSharedPostComments: Error en fetchComments:', error);
    }
  };

  // Fetch comments count
  const fetchCommentsCount = async () => {
    try {
      const { data, error } = await supabase.rpc('get_shared_post_comments_count', {
        shared_post_uuid: sharedPostId
      });

      if (error) {
        console.error('❌ useSharedPostComments: Error obteniendo contador de comentarios:', error);
        throw error;
      }
      
      console.log('📊 useSharedPostComments: Contador de comentarios:', data || 0);
      setCommentsCount(data || 0);
    } catch (error) {
      console.error('❌ useSharedPostComments: Error en fetchCommentsCount:', error);
    }
  };

  // Add new comment
  const addComment = async (content: string) => {
    try {
      setLoading(true);
      console.log('✍️ useSharedPostComments: Agregando comentario para shared post:', { sharedPostId, content: content.substring(0, 50) + '...' });
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "Debes estar autenticado para comentar",
          variant: "destructive"
        });
        return false;
      }

      const { error } = await supabase
        .from('shared_post_comments')
        .insert({
          shared_post_id: sharedPostId,
          user_id: user.id,
          content: content.trim()
        });

      if (error) {
        console.error('❌ useSharedPostComments: Error insertando comentario:', error);
        throw error;
      }

      console.log('✅ useSharedPostComments: Comentario agregado exitosamente');
      toast({
        title: "Éxito",
        description: "Comentario agregado",
      });

      // Refresh comments after adding a new one
      await fetchComments();
      return true;
    } catch (error) {
      console.error('❌ useSharedPostComments: Error agregando comentario:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar el comentario",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete comment
  const deleteComment = async (commentId: string) => {
    try {
      setActionLoading(true);
      console.log('🗑️ useSharedPostComments: Iniciando eliminación de comentario en shared post:', commentId);
      
      // Verificar autenticación
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ useSharedPostComments: Usuario no autenticado');
        toast({
          title: "Error",
          description: "Debes estar autenticado para eliminar un comentario",
          variant: "destructive"
        });
        return false;
      }

      console.log('🔍 useSharedPostComments: Usuario autenticado:', {
        userId: user.id,
        commentId: commentId,
        userIdType: typeof user.id,
        commentIdType: typeof commentId
      });

      // Primero verificar que el comentario existe para debugging
      console.log('🔍 useSharedPostComments: Verificando si el comentario existe...');
      const { data: commentCheck, error: checkError } = await supabase
        .from('shared_post_comments')
        .select('id, user_id, content')
        .eq('id', commentId);

      if (checkError) {
        console.error('❌ useSharedPostComments: Error verificando comentario:', checkError);
      } else {
        console.log('🔍 useSharedPostComments: Comentarios encontrados:', commentCheck);
        if (commentCheck && commentCheck.length > 0) {
          const comment = commentCheck[0];
          console.log('🔍 useSharedPostComments: Detalles del comentario:', {
            commentUserId: comment.user_id,
            currentUserId: user.id,
            idsMatch: String(comment.user_id) === String(user.id),
            commentUserIdType: typeof comment.user_id,
            currentUserIdType: typeof user.id
          });
        } else {
          console.log('❌ useSharedPostComments: No se encontró ningún comentario con ese ID');
        }
      }

      // Eliminar con filtros específicos
      console.log('🔍 useSharedPostComments: Ejecutando eliminación con filtros:', {
        commentId: commentId,
        userId: user.id
      });

      const { data: deleteData, error } = await supabase
        .from('shared_post_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id)
        .select(); // Añadir select para ver qué se eliminó

      console.log('🔍 useSharedPostComments: Resultado de eliminación:', {
        data: deleteData,
        error: error,
        deletedCount: deleteData?.length || 0
      });

      if (error) {
        console.error('❌ useSharedPostComments: Error eliminando comentario:', {
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
        console.error('❌ useSharedPostComments: No se eliminó ningún comentario - posibles causas:');
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

      console.log('✅ useSharedPostComments: Comentario eliminado exitosamente:', deleteData);
      toast({
        title: "Comentario eliminado",
        description: "El comentario se ha eliminado correctamente",
      });

      // Refresh comments after deleting
      await fetchComments();
      return true;
    } catch (error) {
      console.error('❌ useSharedPostComments: Error general eliminando comentario:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el comentario",
        variant: "destructive"
      });
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  // Edit comment
  const editComment = async (commentId: string, newContent: string) => {
    try {
      setActionLoading(true);
      console.log('✏️ useSharedPostComments: Iniciando edición de comentario en shared post:', { 
        commentId, 
        newContent: newContent.substring(0, 50) + '...' 
      });
      
      // Verificar autenticación
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ useSharedPostComments: Usuario no autenticado');
        toast({
          title: "Error",
          description: "Debes estar autenticado para editar un comentario",
          variant: "destructive"
        });
        return false;
      }

      console.log('🔍 useSharedPostComments: Usuario autenticado para edición:', {
        userId: user.id,
        commentId: commentId,
        userIdType: typeof user.id,
        commentIdType: typeof commentId
      });

      // Validar contenido
      if (!newContent || newContent.trim().length === 0) {
        console.error('❌ useSharedPostComments: Contenido vacío');
        toast({
          title: "Error",
          description: "El comentario no puede estar vacío",
          variant: "destructive"
        });
        return false;
      }

      // Verificar que el comentario existe para debugging
      console.log('🔍 useSharedPostComments: Verificando comentario antes de editar...');
      const { data: commentCheck, error: checkError } = await supabase
        .from('shared_post_comments')
        .select('id, user_id, content')
        .eq('id', commentId);

      if (checkError) {
        console.error('❌ useSharedPostComments: Error verificando comentario para edición:', checkError);
      } else {
        console.log('🔍 useSharedPostComments: Comentarios encontrados para edición:', commentCheck);
        if (commentCheck && commentCheck.length > 0) {
          const comment = commentCheck[0];
          console.log('🔍 useSharedPostComments: Detalles del comentario a editar:', {
            commentUserId: comment.user_id,
            currentUserId: user.id,
            idsMatch: String(comment.user_id) === String(user.id),
            currentContent: comment.content,
            newContent: newContent.trim()
          });
        } else {
          console.log('❌ useSharedPostComments: No se encontró comentario para editar');
        }
      }

      // Actualizar con filtros específicos
      console.log('🔍 useSharedPostComments: Ejecutando actualización con filtros:', {
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

      console.log('🔍 useSharedPostComments: Resultado de actualización:', {
        data: data,
        error: error,
        updatedCount: data?.length || 0
      });

      if (error) {
        console.error('❌ useSharedPostComments: Error editando comentario:', {
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
        console.error('❌ useSharedPostComments: No se actualizó ningún comentario - posibles causas:');
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

      console.log('✅ useSharedPostComments: Comentario editado exitosamente:', data);
      toast({
        title: "Comentario actualizado",
        description: "Los cambios se han guardado correctamente",
      });

      // Refresh comments after editing
      await fetchComments();
      return true;
    } catch (error) {
      console.error('❌ useSharedPostComments: Error general editando comentario:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el comentario",
        variant: "destructive"
      });
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  // Report comment
  const reportComment = async (commentId: string, reason: string = 'Contenido inapropiado') => {
    try {
      setActionLoading(true);
      console.log('🚩 useSharedPostComments: Iniciando reporte de comentario en shared post:', { commentId, reason });
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "Debes estar autenticado para reportar",
          variant: "destructive"
        });
        return false;
      }

      console.log('🔍 useSharedPostComments: Usuario autenticado para reporte:', user.id);

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
        console.error('❌ useSharedPostComments: Error reportando comentario:', error);
        throw error;
      }

      console.log('✅ useSharedPostComments: Comentario reportado exitosamente');
      toast({
        title: "Reporte enviado",
        description: "Hemos recibido tu reporte y lo revisaremos pronto",
      });

      return true;
    } catch (error) {
      console.error('❌ useSharedPostComments: Error reportando comentario:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar el reporte",
        variant: "destructive"
      });
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    fetchComments();
    fetchCommentsCount();

    console.log('🔄 useSharedPostComments: Configurando suscripción en tiempo real para shared post:', sharedPostId);
    
    // Subscribe to real-time changes
    const channel = supabase
      .channel(`shared-post-comments-${sharedPostId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shared_post_comments',
          filter: `shared_post_id=eq.${sharedPostId}`
        },
        (payload) => {
          console.log('🔔 useSharedPostComments: Cambio en tiempo real detectado:', payload);
          fetchComments();
          fetchCommentsCount();
        }
      )
      .subscribe();

    return () => {
      console.log('🔌 useSharedPostComments: Desconectando suscripción para shared post:', sharedPostId);
      supabase.removeChannel(channel);
    };
  }, [sharedPostId]);

  return {
    comments,
    commentsCount,
    loading,
    actionLoading,
    addComment,
    editComment,
    deleteComment,
    reportComment,
    refreshComments: fetchComments
  };
};
