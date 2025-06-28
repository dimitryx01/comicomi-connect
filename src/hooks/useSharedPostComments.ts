
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface SharedPostComment {
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
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchComments = useCallback(async () => {
    if (!sharedPostId) return;

    setLoading(true);
    try {
      console.log('🔄 useSharedPostComments: Obteniendo comentarios para shared post:', sharedPostId);

      const { data, error } = await supabase
        .rpc('get_shared_post_comments', { shared_post_uuid: sharedPostId });

      if (error) {
        console.error('❌ useSharedPostComments: Error obteniendo comentarios:', error);
        throw error;
      }

      console.log('✅ useSharedPostComments: Comentarios obtenidos:', {
        count: data?.length || 0,
        comments: data
      });

      setComments(data || []);
    } catch (error) {
      console.error('❌ useSharedPostComments: Error completo:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los comentarios",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [sharedPostId, toast]);

  const addComment = useCallback(async (content: string) => {
    if (!user || !content.trim()) return false;

    try {
      console.log('🔄 useSharedPostComments: Añadiendo comentario:', { sharedPostId, content });

      const { data, error } = await supabase
        .from('shared_post_comments')
        .insert({
          shared_post_id: sharedPostId,
          user_id: user.id,
          content: content.trim()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ useSharedPostComments: Error añadiendo comentario:', error);
        throw error;
      }

      console.log('✅ useSharedPostComments: Comentario añadido:', data);
      
      toast({
        title: "Comentario añadido",
        description: "Tu comentario ha sido publicado correctamente"
      });

      // Refrescar comentarios
      await fetchComments();
      return true;
    } catch (error) {
      console.error('❌ useSharedPostComments: Error completo añadiendo comentario:', error);
      toast({
        title: "Error",
        description: "No se pudo añadir el comentario",
        variant: "destructive"
      });
      return false;
    }
  }, [user, sharedPostId, fetchComments, toast]);

  const refreshComments = useCallback(() => {
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return {
    comments,
    loading,
    addComment,
    refreshComments
  };
};
