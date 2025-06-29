
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user_full_name: string;
  user_username: string;
  user_avatar_url: string;
  cheers_count: number;
}

export const useComments = (postId: string, isSharedPost: boolean = false) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsCount, setCommentsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch comments
  const fetchComments = async () => {
    try {
      console.log('💬 useComments: Obteniendo comentarios para:', { postId, isSharedPost });
      
      const { data, error } = await supabase.rpc('get_post_comments', {
        post_uuid: postId
      });

      if (error) {
        console.error('❌ useComments: Error obteniendo comentarios:', error);
        console.error('❌ useComments: Error details:', JSON.stringify(error, null, 2));
        throw error;
      }
      
      console.log('📝 useComments: Comentarios obtenidos exitosamente:', data?.length || 0);
      setComments(data || []);
      setCommentsCount(data?.length || 0);
    } catch (error) {
      console.error('❌ useComments: Error en fetchComments:', error);
    }
  };

  // Fetch comments count
  const fetchCommentsCount = async () => {
    try {
      console.log('📊 useComments: Obteniendo contador de comentarios para:', postId);
      
      const { data, error } = await supabase.rpc('get_post_comments_count', {
        post_uuid: postId
      });

      if (error) {
        console.error('❌ useComments: Error obteniendo contador:', error);
        console.error('❌ useComments: Error details:', JSON.stringify(error, null, 2));
        throw error;
      }
      
      console.log('📊 useComments: Contador obtenido exitosamente:', data || 0);
      setCommentsCount(data || 0);
    } catch (error) {
      console.error('❌ useComments: Error en fetchCommentsCount:', error);
    }
  };

  // Add new comment
  const addComment = async (content: string) => {
    try {
      setLoading(true);
      console.log('✍️ useComments: Iniciando addComment...', { 
        postId, 
        isSharedPost, 
        contentLength: content.length 
      });
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('❌ useComments: Usuario no autenticado');
        toast({
          title: "Error",
          description: "Debes estar autenticado para comentar",
          variant: "destructive"
        });
        return false;
      }

      console.log('👤 useComments: Usuario autenticado:', user.id);
      console.log('📝 useComments: Insertando comentario en tabla comments...');

      const insertData = {
        post_id: postId,
        user_id: user.id,
        content: content.trim()
      };

      console.log('📝 useComments: Datos a insertar:', insertData);

      const { error } = await supabase
        .from('comments')
        .insert(insertData);

      if (error) {
        console.error('❌ useComments: Error insertando comentario:', error);
        console.error('❌ useComments: Detalles completos del error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          postId,
          userId: user.id,
          content: content.substring(0, 50) + '...'
        });
        throw error;
      }

      console.log('✅ useComments: Comentario insertado exitosamente');
      toast({
        title: "Éxito",
        description: "Comentario agregado",
      });

      // Refrescar comentarios después de agregar uno nuevo
      await fetchComments();
      return true;
    } catch (error) {
      console.error('❌ useComments: Error agregando comentario:', error);
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

  // Set up real-time subscription
  useEffect(() => {
    console.log('🔄 useComments: Inicializando hook para:', { postId, isSharedPost });
    
    fetchComments();
    fetchCommentsCount();

    console.log('🔄 useComments: Configurando suscripción en tiempo real para:', postId);
    
    // Subscribe to real-time changes
    const channel = supabase
      .channel(`comments-${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`
        },
        (payload) => {
          console.log('🔔 useComments: Cambio en tiempo real detectado:', payload);
          fetchComments();
          fetchCommentsCount();
        }
      )
      .subscribe();

    return () => {
      console.log('🔌 useComments: Desconectando suscripción para:', postId);
      supabase.removeChannel(channel);
    };
  }, [postId, isSharedPost]);

  return {
    comments,
    commentsCount,
    loading,
    addComment,
    refreshComments: fetchComments
  };
};
