
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePostsRealtime = (currentPage: number, refreshPosts: () => void) => {
  const setupRealtimeSubscription = useCallback(() => {
    console.log('🔔 usePostsRealtime: Configurando suscripción en tiempo real...');

    const channel = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          console.log('📨 usePostsRealtime: Cambio en tiempo real detectado:', payload);
          // Only refresh if we're on the first page to avoid disrupting pagination
          if (currentPage === 1) {
            refreshPosts();
          }
        }
      )
      .subscribe();

    return () => {
      console.log('🛑 usePostsRealtime: Limpiando suscripción...');
      supabase.removeChannel(channel);
    };
  }, [currentPage, refreshPosts]);

  useEffect(() => {
    return setupRealtimeSubscription();
  }, [setupRealtimeSubscription]);
};
