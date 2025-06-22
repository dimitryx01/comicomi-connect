
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
    addComment,
    refreshComments: fetchComments
  };
};
