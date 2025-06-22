
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useCheers = (postId: string, isSharedPost: boolean = false) => {
  const [cheersCount, setCheersCount] = useState(0);
  const [hasCheered, setHasCheered] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchCheersData();
  }, [postId, user, isSharedPost]);

  const fetchCheersData = async () => {
    try {
      console.log('🎉 useCheers: Obteniendo datos de cheers para:', { postId, isSharedPost });
      
      // Para publicaciones compartidas, buscamos en cheers donde post_id coincida con shared_posts.id
      // Para posts normales, buscamos directamente en posts
      let query;
      
      if (isSharedPost) {
        // Para shared posts, necesitamos usar el ID de la shared_post directamente
        const { count: cheersCountData, error: countError } = await supabase
          .from('cheers')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', postId);
        
        if (countError) {
          console.error('❌ useCheers: Error obteniendo contador de cheers:', countError);
        } else {
          console.log('📊 useCheers: Contador de cheers obtenido:', cheersCountData);
          setCheersCount(cheersCountData || 0);
        }

        // Verificar si el usuario actual ya dio cheers
        if (user) {
          const { data: hasCheerData, error: hasCheerError } = await supabase
            .from('cheers')
            .select('id')
            .eq('post_id', postId)
            .eq('user_id', user.id)
            .single();
          
          if (hasCheerError && hasCheerError.code !== 'PGRST116') {
            console.error('❌ useCheers: Error verificando cheer del usuario:', hasCheerError);
          } else {
            console.log('👤 useCheers: Estado de cheer del usuario:', !!hasCheerData);
            setHasCheered(!!hasCheerData);
          }
        }
      } else {
        // Lógica original para posts normales
        const { count: cheersCountData, error: countError } = await supabase
          .from('cheers')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', postId);
        
        if (countError) throw countError;
        setCheersCount(cheersCountData || 0);

        if (user) {
          const { data: hasCheerData, error: hasCheerError } = await supabase
            .from('cheers')
            .select('id')
            .eq('post_id', postId)
            .eq('user_id', user.id)
            .single();
          
          if (hasCheerError && hasCheerError.code !== 'PGRST116') {
            throw hasCheerError;
          }
          
          setHasCheered(!!hasCheerData);
        }
      }
    } catch (error) {
      console.error('❌ useCheers: Error obteniendo datos de cheers:', error);
    }
  };

  const toggleCheer = async () => {
    if (!user || loading) {
      console.log('⚠️ useCheers: No se puede hacer cheer - usuario no autenticado o cargando');
      return;
    }

    setLoading(true);
    try {
      console.log('🔄 useCheers: Alternando cheer para:', { postId, isSharedPost, hasCheered });
      
      if (hasCheered) {
        // Remover cheer
        const { error } = await supabase
          .from('cheers')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) {
          console.error('❌ useCheers: Error removiendo cheer:', error);
          throw error;
        }

        console.log('✅ useCheers: Cheer removido exitosamente');
        setCheersCount(prev => prev - 1);
        setHasCheered(false);
      } else {
        // Agregar cheer
        const { error } = await supabase
          .from('cheers')
          .insert({
            post_id: postId,
            user_id: user.id
          });

        if (error) {
          console.error('❌ useCheers: Error agregando cheer:', error);
          throw error;
        }

        console.log('✅ useCheers: Cheer agregado exitosamente');
        setCheersCount(prev => prev + 1);
        setHasCheered(true);
      }
    } catch (error) {
      console.error('❌ useCheers: Error en toggleCheer:', error);
      // Revertir el estado optimista si hay error
      await fetchCheersData();
    } finally {
      setLoading(false);
    }
  };

  return {
    cheersCount,
    hasCheered,
    loading,
    toggleCheer
  };
};
