
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useSharedPostCheers = (sharedPostId: string) => {
  const [cheersCount, setCheersCount] = useState(0);
  const [hasCheered, setHasCheered] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchCheersData();
  }, [sharedPostId, user]);

  const fetchCheersData = async () => {
    try {
      console.log('🎉 useSharedPostCheers: Obteniendo datos de cheers para shared post:', sharedPostId);
      
      // Get cheers count
      const { count: cheersCountData, error: countError } = await supabase
        .from('shared_post_cheers')
        .select('*', { count: 'exact', head: true })
        .eq('shared_post_id', sharedPostId);
      
      if (countError) {
        console.error('❌ useSharedPostCheers: Error obteniendo contador de cheers:', countError);
        throw countError;
      }
      
      console.log('📊 useSharedPostCheers: Contador de cheers obtenido:', cheersCountData);
      setCheersCount(cheersCountData || 0);

      // Check if current user has cheered
      if (user) {
        const { data: hasCheerData, error: hasCheerError } = await supabase
          .from('shared_post_cheers')
          .select('id')
          .eq('shared_post_id', sharedPostId)
          .eq('user_id', user.id)
          .single();
        
        if (hasCheerError && hasCheerError.code !== 'PGRST116') {
          console.error('❌ useSharedPostCheers: Error verificando cheer del usuario:', hasCheerError);
          throw hasCheerError;
        }
        
        console.log('👤 useSharedPostCheers: Estado de cheer del usuario:', !!hasCheerData);
        setHasCheered(!!hasCheerData);
      }
    } catch (error) {
      console.error('❌ useSharedPostCheers: Error obteniendo datos de cheers:', error);
    }
  };

  const toggleCheer = async () => {
    if (!user || loading) {
      console.log('⚠️ useSharedPostCheers: No se puede hacer cheer - usuario no autenticado o cargando');
      return;
    }

    setLoading(true);
    try {
      console.log('🔄 useSharedPostCheers: Alternando cheer para shared post:', { sharedPostId, hasCheered });
      
      if (hasCheered) {
        // Remove cheer
        const { error } = await supabase
          .from('shared_post_cheers')
          .delete()
          .eq('shared_post_id', sharedPostId)
          .eq('user_id', user.id);

        if (error) {
          console.error('❌ useSharedPostCheers: Error removiendo cheer:', error);
          throw error;
        }

        console.log('✅ useSharedPostCheers: Cheer removido exitosamente');
        setCheersCount(prev => prev - 1);
        setHasCheered(false);
      } else {
        // Add cheer
        const { error } = await supabase
          .from('shared_post_cheers')
          .insert({
            shared_post_id: sharedPostId,
            user_id: user.id
          });

        if (error) {
          console.error('❌ useSharedPostCheers: Error agregando cheer:', error);
          throw error;
        }

        console.log('✅ useSharedPostCheers: Cheer agregado exitosamente');
        setCheersCount(prev => prev + 1);
        setHasCheered(true);
      }
    } catch (error) {
      console.error('❌ useSharedPostCheers: Error en toggleCheer:', error);
      // Revert optimistic state if error
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
