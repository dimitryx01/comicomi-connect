
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSharedCount = (contentId: string, contentType: 'post' | 'recipe' | 'restaurant') => {
  const [sharedCount, setSharedCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchSharedCount = useCallback(async () => {
    if (!contentId || !contentType) return;

    setLoading(true);
    try {
      let query = supabase
        .from('shared_posts')
        .select('*', { count: 'exact', head: true });

      // Filtrar por el tipo de contenido correcto
      if (contentType === 'post') {
        query = query.eq('shared_post_id', contentId);
      } else if (contentType === 'recipe') {
        query = query.eq('shared_recipe_id', contentId);
      } else if (contentType === 'restaurant') {
        query = query.eq('shared_restaurant_id', contentId);
      }

      const { count, error } = await query;

      if (error) {
        console.error('❌ useSharedCount: Error obteniendo contador:', error);
        return;
      }

      setSharedCount(count || 0);
      console.log('✅ useSharedCount: Contador obtenido:', { contentId, contentType, count });
    } catch (error) {
      console.error('❌ useSharedCount: Error:', error);
    } finally {
      setLoading(false);
    }
  }, [contentId, contentType]);

  useEffect(() => {
    fetchSharedCount();
  }, [fetchSharedCount]);

  // Suscripción en tiempo real para actualizar el contador
  useEffect(() => {
    if (!contentId || !contentType) return;

    const channel = supabase
      .channel(`shared_count_${contentType}_${contentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shared_posts',
          filter: contentType === 'post' 
            ? `shared_post_id=eq.${contentId}`
            : contentType === 'recipe'
            ? `shared_recipe_id=eq.${contentId}`
            : `shared_restaurant_id=eq.${contentId}`
        },
        () => {
          console.log('🔄 useSharedCount: Actualizando contador en tiempo real');
          fetchSharedCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [contentId, contentType, fetchSharedCount]);

  return {
    sharedCount,
    loading,
    refetch: fetchSharedCount
  };
};
