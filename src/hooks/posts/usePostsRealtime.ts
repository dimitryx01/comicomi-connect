
import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePostsRealtime = (currentPage: number, refreshPosts: () => void) => {
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);
  const lastOptimisticUpdateRef = useRef<number>(0);

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
          
          // Si es un INSERT y ha pasado poco tiempo desde la última actualización optimista,
          // probablemente es nuestro propio post, así que no refrescamos
          const now = Date.now();
          const timeSinceLastOptimistic = now - lastOptimisticUpdateRef.current;
          
          if (payload.eventType === 'INSERT' && timeSinceLastOptimistic < 3000) {
            console.log('🚫 usePostsRealtime: Ignorando INSERT reciente (probablemente actualización optimista)');
            return;
          }
          
          // Para otros eventos o INSERTs más antiguos, refrescar
          console.log('🔄 usePostsRealtime: Refrescando posts debido a cambio externo');
          refreshPosts();
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
  }, [refreshPosts]);

  // Función para marcar que se hizo una actualización optimista
  const markOptimisticUpdate = useCallback(() => {
    lastOptimisticUpdateRef.current = Date.now();
    console.log('⏰ usePostsRealtime: Marcada actualización optimista');
  }, []);

  useEffect(() => {
    const cleanup = setupRealtimeSubscription();
    
    return () => {
      cleanup();
    };
  }, [setupRealtimeSubscription]);

  return { markOptimisticUpdate };
};
