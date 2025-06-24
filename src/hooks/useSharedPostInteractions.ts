
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSharedPostInteractions = (sharedPostId: string) => {
  const [cheersCount, setCheersCount] = useState(0);
  const [hasCheered, setHasCheered] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [sharedPostId, user]);

  const fetchData = async () => {
    try {
      console.log('🔄 useSharedPostInteractions: Obteniendo datos para shared post:', sharedPostId);
      
      // Obtener conteo de cheers
      const { count: cheersCountData, error: cheersError } = await supabase
        .from('shared_post_cheers')
        .select('*', { count: 'exact', head: true })
        .eq('shared_post_id', sharedPostId);
      
      if (cheersError) {
        console.error('❌ useSharedPostInteractions: Error obteniendo cheers:', cheersError);
      } else {
        setCheersCount(cheersCountData || 0);
      }

      // Obtener conteo de comentarios
      const { count: commentsCountData, error: commentsError } = await supabase
        .from('shared_post_comments')
        .select('*', { count: 'exact', head: true })
        .eq('shared_post_id', sharedPostId);
      
      if (commentsError) {
        console.error('❌ useSharedPostInteractions: Error obteniendo comentarios:', commentsError);
      } else {
        setCommentsCount(commentsCountData || 0);
      }

      // Verificar si el usuario actual ha dado cheer
      if (user) {
        const { data: userCheer, error: userCheerError } = await supabase
          .from('shared_post_cheers')
          .select('id')
          .eq('shared_post_id', sharedPostId)
          .eq('user_id', user.id)
          .single();
        
        if (userCheerError && userCheerError.code !== 'PGRST116') {
          console.error('❌ useSharedPostInteractions: Error verificando cheer del usuario:', userCheerError);
        } else {
          setHasCheered(!!userCheer);
        }
      }
    } catch (error) {
      console.error('❌ useSharedPostInteractions: Error en fetchData:', error);
    }
  };

  const toggleCheer = async () => {
    if (!user || loading) {
      console.log('⚠️ useSharedPostInteractions: No se puede hacer cheer');
      return;
    }

    setLoading(true);
    try {
      console.log('🔄 useSharedPostInteractions: Alternando cheer:', { sharedPostId, hasCheered });
      
      if (hasCheered) {
        // Remover cheer
        const { error } = await supabase
          .from('shared_post_cheers')
          .delete()
          .eq('shared_post_id', sharedPostId)
          .eq('user_id', user.id);

        if (error) throw error;

        setCheersCount(prev => prev - 1);
        setHasCheered(false);
      } else {
        // Agregar cheer
        const { error } = await supabase
          .from('shared_post_cheers')
          .insert({
            shared_post_id: sharedPostId,
            user_id: user.id
          });

        if (error) throw error;

        setCheersCount(prev => prev + 1);
        setHasCheered(true);
      }
    } catch (error) {
      console.error('❌ useSharedPostInteractions: Error en toggleCheer:', error);
      toast({
        title: "Error",
        description: "No se pudo procesar la acción",
        variant: "destructive"
      });
      await fetchData(); // Revertir estado optimista
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (content: string) => {
    if (!user || !content.trim()) {
      return false;
    }

    try {
      setLoading(true);
      console.log('✍️ useSharedPostInteractions: Agregando comentario:', sharedPostId);
      
      const { error } = await supabase
        .from('shared_post_comments')
        .insert({
          shared_post_id: sharedPostId,
          user_id: user.id,
          content: content.trim()
        });

      if (error) throw error;

      await fetchData(); // Refrescar datos
      toast({
        title: "Éxito",
        description: "Comentario agregado",
      });
      return true;
    } catch (error) {
      console.error('❌ useSharedPostInteractions: Error agregando comentario:', error);
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

  return {
    cheersCount,
    hasCheered,
    commentsCount,
    loading,
    toggleCheer,
    addComment,
    refreshData: fetchData
  };
};
