
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

export const useSharedPostInteractions = (sharedPostId: string) => {
  const [cheersCount, setCheersCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [hasCheered, setHasCheered] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fetchCounts = useCallback(async () => {
    if (!sharedPostId) return;

    try {
      console.log('🔄 useSharedPostInteractions: Obteniendo conteos para shared post:', sharedPostId);

      // Obtener conteo de cheers
      const { count: cheersCountResult, error: cheersError } = await supabase
        .from('shared_post_cheers')
        .select('*', { count: 'exact', head: true })
        .eq('shared_post_id', sharedPostId);

      if (cheersError) {
        console.error('❌ Error obteniendo cheers count:', cheersError);
      } else {
        setCheersCount(cheersCountResult || 0);
        console.log('✅ Cheers count:', cheersCountResult);
      }

      // Obtener conteo de comentarios
      const { count: commentsCountResult, error: commentsError } = await supabase
        .from('shared_post_comments')
        .select('*', { count: 'exact', head: true })
        .eq('shared_post_id', sharedPostId);

      if (commentsError) {
        console.error('❌ Error obteniendo comments count:', commentsError);
      } else {
        setCommentsCount(commentsCountResult || 0);
        console.log('✅ Comments count:', commentsCountResult);
      }

      // Verificar si el usuario actual ha dado cheer
      if (user) {
        const { data: userCheer } = await supabase
          .from('shared_post_cheers')
          .select('id')
          .eq('shared_post_id', sharedPostId)
          .eq('user_id', user.id)
          .single();

        setHasCheered(!!userCheer);
        console.log('✅ Has cheered:', !!userCheer);
      }

    } catch (error) {
      console.error('❌ useSharedPostInteractions: Error obteniendo conteos:', error);
    }
  }, [sharedPostId, user]);

  const toggleCheer = useCallback(async () => {
    if (!user || loading) return;

    setLoading(true);
    try {
      console.log('🔄 useSharedPostInteractions: Toggle cheer:', { sharedPostId, hasCheered });

      if (hasCheered) {
        // Quitar cheer
        const { error } = await supabase
          .from('shared_post_cheers')
          .delete()
          .eq('shared_post_id', sharedPostId)
          .eq('user_id', user.id);

        if (error) throw error;

        setHasCheered(false);
        setCheersCount(prev => Math.max(0, prev - 1));
        console.log('✅ Cheer removed');
      } else {
        // Añadir cheer
        const { error } = await supabase
          .from('shared_post_cheers')
          .insert({
            shared_post_id: sharedPostId,
            user_id: user.id
          });

        if (error) throw error;

        setHasCheered(true);
        setCheersCount(prev => prev + 1);
        console.log('✅ Cheer added');
      }
    } catch (error) {
      console.error('❌ useSharedPostInteractions: Error toggle cheer:', error);
      toast({
        title: "Error",
        description: "No se pudo procesar la acción",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, loading, hasCheered, sharedPostId, toast]);

  const deleteSharedPost = useCallback(async (postId: string) => {
    if (!user || loading) return false;

    setLoading(true);
    try {
      console.log('🔄 useSharedPostInteractions: Eliminando shared post:', postId);

      const { error } = await supabase
        .from('shared_posts')
        .delete()
        .eq('id', postId)
        .eq('sharer_id', user.id);

      if (error) throw error;

      console.log('✅ Shared post eliminado correctamente');
      
      toast({
        title: "Publicación eliminada",
        description: "La publicación compartida ha sido eliminada"
      });

      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['shared-posts'] });

      return true;
    } catch (error) {
      console.error('❌ useSharedPostInteractions: Error eliminando shared post:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la publicación",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, loading, toast, queryClient]);

  const addComment = useCallback(async (content: string) => {
    if (!user || !content.trim()) return false;

    try {
      console.log('🔄 useSharedPostInteractions: Añadiendo comentario:', { sharedPostId, content });

      const { error } = await supabase
        .from('shared_post_comments')
        .insert({
          shared_post_id: sharedPostId,
          user_id: user.id,
          content: content.trim()
        });

      if (error) throw error;

      console.log('✅ Comentario añadido exitosamente');
      
      // Actualizar conteo de comentarios
      setCommentsCount(prev => prev + 1);
      
      toast({
        title: "Comentario añadido",
        description: "Tu comentario ha sido publicado"
      });

      return true;
    } catch (error) {
      console.error('❌ useSharedPostInteractions: Error añadiendo comentario:', error);
      toast({
        title: "Error",
        description: "No se pudo añadir el comentario",
        variant: "destructive"
      });
      return false;
    }
  }, [user, sharedPostId, toast]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  return {
    cheersCount,
    commentsCount,
    hasCheered,
    loading,
    toggleCheer,
    deleteSharedPost,
    addComment,
    refreshCounts: fetchCounts
  };
};
