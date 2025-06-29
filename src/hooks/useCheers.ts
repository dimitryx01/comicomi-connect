
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useCheers = (postId: string, isSharedPost: boolean = false) => {
  const [cheersCount, setCheersCount] = useState(0);
  const [hasCheered, setHasCheered] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    console.log('🎉 useCheers: Inicializando hook para:', { postId, isSharedPost, userId: user?.id });
    fetchCheersData();
  }, [postId, user, isSharedPost]);

  const fetchCheersData = async () => {
    try {
      console.log('🎉 useCheers: Obteniendo datos de cheers para:', { postId, isSharedPost });
      
      // Para publicaciones compartidas, buscamos en cheers donde post_id coincida con shared_posts.id
      // Para posts normales, buscamos directamente en posts
      let query;
      
      if (isSharedPost) {
        console.log('🔄 useCheers: Procesando shared post...');
        // Para shared posts, necesitamos usar el ID de la shared_post directamente
        const { count: cheersCountData, error: countError } = await supabase
          .from('cheers')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', postId);
        
        if (countError) {
          console.error('❌ useCheers: Error obteniendo contador de cheers:', countError);
          console.error('❌ useCheers: Error details:', JSON.stringify(countError, null, 2));
        } else {
          console.log('📊 useCheers: Contador de cheers obtenido:', cheersCountData);
          setCheersCount(cheersCountData || 0);
        }

        // Verificar si el usuario actual ya dio cheers
        if (user) {
          console.log('👤 useCheers: Verificando cheer del usuario:', user.id);
          const { data: hasCheerData, error: hasCheerError } = await supabase
            .from('cheers')
            .select('id')
            .eq('post_id', postId)
            .eq('user_id', user.id)
            .single();
          
          if (hasCheerError && hasCheerError.code !== 'PGRST116') {
            console.error('❌ useCheers: Error verificando cheer del usuario:', hasCheerError);
            console.error('❌ useCheers: Error details:', JSON.stringify(hasCheerError, null, 2));
          } else {
            console.log('👤 useCheers: Estado de cheer del usuario:', !!hasCheerData);
            setHasCheered(!!hasCheerData);
          }
        }
      } else {
        console.log('🔄 useCheers: Procesando post normal...');
        // Lógica original para posts normales
        const { count: cheersCountData, error: countError } = await supabase
          .from('cheers')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', postId);
        
        if (countError) {
          console.error('❌ useCheers: Error obteniendo contador:', countError);
          console.error('❌ useCheers: Error details:', JSON.stringify(countError, null, 2));
          throw countError;
        }
        
        console.log('📊 useCheers: Contador obtenido exitosamente:', cheersCountData);
        setCheersCount(cheersCountData || 0);

        if (user) {
          console.log('👤 useCheers: Verificando cheer del usuario:', user.id);
          const { data: hasCheerData, error: hasCheerError } = await supabase
            .from('cheers')
            .select('id')
            .eq('post_id', postId)
            .eq('user_id', user.id)
            .single();
          
          if (hasCheerError && hasCheerError.code !== 'PGRST116') {
            console.error('❌ useCheers: Error verificando cheer:', hasCheerError);
            console.error('❌ useCheers: Error details:', JSON.stringify(hasCheerError, null, 2));
            throw hasCheerError;
          }
          
          console.log('👤 useCheers: Estado de cheer obtenido:', !!hasCheerData);
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
      console.log('👤 useCheers: Usuario que intenta dar cheer:', user.id);
      
      if (hasCheered) {
        // Remover cheer
        console.log('➖ useCheers: Removiendo cheer...');
        
        const deleteData = {
          post_id: postId,
          user_id: user.id
        };
        
        console.log('➖ useCheers: Datos para eliminar:', deleteData);
        
        const { error } = await supabase
          .from('cheers')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) {
          console.error('❌ useCheers: Error removiendo cheer:', error);
          console.error('❌ useCheers: Error details completos:', {
            error: error,
            code: error.code,
            message: error.message,
            details: error.details,
            postId,
            userId: user.id
          });
          throw error;
        }

        console.log('✅ useCheers: Cheer removido exitosamente');
        setCheersCount(prev => prev - 1);
        setHasCheered(false);
      } else {
        // Agregar cheer
        console.log('➕ useCheers: Agregando cheer...');
        
        const insertData = {
          post_id: postId,
          user_id: user.id
        };
        
        console.log('➕ useCheers: Datos para insertar:', insertData);
        
        const { error } = await supabase
          .from('cheers')
          .insert(insertData);

        if (error) {
          console.error('❌ useCheers: Error agregando cheer:', error);
          console.error('❌ useCheers: Error details completos:', {
            error: error,
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
            postId: postId,
            userId: user.id
          });
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
