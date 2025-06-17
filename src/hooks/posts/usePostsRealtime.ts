
import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePostsRealtime = (currentPage: number, refreshPosts: () => void) => {
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

  const setupRealtimeSubscription = useCallback(() => {
    // Evitar múltiples suscripciones
    if (isSubscribedRef.current || channelRef.current) {
      console.log('🔔 usePostsRealtime: Ya existe una suscripción activa, omitiendo...');
      return () => {};
    }

    console.log('🔔 usePostsRealtime: Configurando nueva suscripción en tiempo real...');

    const channel = supabase
      .channel(`posts-changes-${Date.now()}`) // Nombre único para evitar conflictos
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
      .subscribe((status) => {
        console.log('🔔 usePostsRealtime: Estado de suscripción:', status);
        if (status === 'SUBSCRIBED') {
          isSubscribedRef.current = true;
        }
      });

    channelRef.current = channel;

    return () => {
      console.log('🛑 usePostsRealtime: Limpiando suscripción...');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      isSubscribedRef.current = false;
    };
  }, [currentPage, refreshPosts]);

  useEffect(() => {
    const cleanup = setupRealtimeSubscription();
    
    return () => {
      cleanup();
    };
  }, [setupRealtimeSubscription]);
};
