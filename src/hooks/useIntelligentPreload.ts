
import { useEffect, useCallback, useMemo } from 'react';
import { unifiedMediaCache } from '@/utils/unifiedMediaCache';
import { getSignedMediaUrl } from '@/utils/mediaStorage';

interface FeedItem {
  images?: string[];
  videos?: string[];
  authorAvatar?: string;
  authorId?: string;
}

interface UseIntelligentPreloadOptions {
  enabled?: boolean;
  preloadDistance?: number; // Cuántos items adelante precargar
  priorityThreshold?: number; // Primeros N items con alta prioridad
}

/**
 * Hook para precarga inteligente de medios en el feed
 * Optimiza transacciones Clase B precargando contenido que probablemente se verá
 */
export const useIntelligentPreload = (
  feedItems: FeedItem[],
  options?: UseIntelligentPreloadOptions
) => {
  const { 
    enabled = true, 
    preloadDistance = 10,
    priorityThreshold = 3 
  } = options || {};

  // Memoizar el hash de feedItems para evitar ejecuciones innecesarias
  const feedItemsHash = useMemo(() => {
    if (!feedItems || feedItems.length === 0) return 'empty';
    
    // Crear un hash simple basado en los primeros elementos
    const firstItems = feedItems.slice(0, 5).map(item => ({
      imageCount: item.images?.length || 0,
      videoCount: item.videos?.length || 0,
      hasAvatar: !!item.authorAvatar
    }));
    
    return JSON.stringify(firstItems);
  }, [feedItems]);

  const preloadFeedMedia = useCallback(() => {
    if (!enabled || !feedItems || feedItems.length === 0) {
      console.log('🎯 useIntelligentPreload: Precarga deshabilitada o sin items');
      return;
    }

    console.log('🎯 useIntelligentPreload: Iniciando precarga inteligente:', {
      totalItems: feedItems.length,
      preloadDistance,
      priorityThreshold,
      feedItemsHash
    });

    try {
      // Preparar datos para precarga con seguridad
      const itemsToPreload = feedItems.slice(0, preloadDistance).map((item, index) => {
        const priority = index < priorityThreshold ? 'high' as const : 
                        index < priorityThreshold * 2 ? 'medium' as const : 'low' as const;

        return {
          images: Array.isArray(item.images) ? item.images : [],
          videos: Array.isArray(item.videos) ? item.videos : [],
          authorAvatar: typeof item.authorAvatar === 'string' ? item.authorAvatar : undefined,
          priority
        };
      });

      // Usar el sistema de precarga del cache unificado
      unifiedMediaCache.preloadFeedMedia(
        itemsToPreload,
        async (fileId: string) => {
          if (!fileId || typeof fileId !== 'string') {
            throw new Error('FileId inválido para precarga');
          }
          return await getSignedMediaUrl(fileId);
        }
      );

      // Métricas de precarga
      const totalPreloadItems = itemsToPreload.reduce((total, item) => {
        return total + item.images.length + item.videos.length + (item.authorAvatar ? 1 : 0);
      }, 0);

      console.log('✅ useIntelligentPreload: Precarga programada:', {
        itemsProcessed: itemsToPreload.length,
        totalMediaItems: totalPreloadItems,
        highPriorityItems: itemsToPreload.filter(i => i.priority === 'high').length
      });
    } catch (error) {
      console.error('❌ useIntelligentPreload: Error en precarga:', error);
    }
  }, [enabled, feedItems, preloadDistance, priorityThreshold, feedItemsHash]);

  // Precargar cuando cambie el feedItemsHash (evitar bucles)
  useEffect(() => {
    if (feedItemsHash === 'empty') return;
    
    console.log('🔄 useIntelligentPreload: FeedItems hash cambió, programando precarga:', feedItemsHash);
    
    // Usar setTimeout para evitar bloquear el UI y prevenir bucles
    const timer = setTimeout(() => {
      preloadFeedMedia();
    }, 1000); // Delay más largo para estabilidad
    
    return () => {
      clearTimeout(timer);
    };
  }, [feedItemsHash, preloadFeedMedia]);

  // Precargar avatares de usuarios específicos (por ejemplo, usuarios seguidos)
  const preloadUserAvatars = useCallback((userIds: string[]) => {
    if (!enabled || !Array.isArray(userIds)) {
      console.log('🎯 useIntelligentPreload: Precarga de avatares deshabilitada');
      return;
    }

    console.log('👥 useIntelligentPreload: Precargando avatares de usuarios:', {
      userCount: userIds.length
    });

    try {
      userIds.forEach(userId => {
        if (!userId || typeof userId !== 'string') return;
        
        // Asumir que el avatar está en una ruta específica
        const avatarFileId = `avatars/${userId}`;
        
        unifiedMediaCache.addToPreloadQueue(
          avatarFileId,
          async () => await getSignedMediaUrl(avatarFileId),
          { type: 'avatar', priority: 'high' }
        );
      });
    } catch (error) {
      console.error('❌ useIntelligentPreload: Error precargando avatares:', error);
    }
  }, [enabled]);

  // Precargar medios específicos con prioridad
  const preloadSpecificMedia = useCallback((
    mediaIds: string[], 
    type: 'avatar' | 'media' = 'media',
    priority: 'high' | 'medium' | 'low' = 'medium'
  ) => {
    if (!enabled || !Array.isArray(mediaIds)) {
      console.log('🎯 useIntelligentPreload: Precarga específica deshabilitada');
      return;
    }

    console.log('📁 useIntelligentPreload: Precargando medios específicos:', {
      mediaCount: mediaIds.length,
      type,
      priority
    });

    try {
      mediaIds.forEach(mediaId => {
        if (!mediaId || typeof mediaId !== 'string') return;
        
        unifiedMediaCache.addToPreloadQueue(
          mediaId,
          async () => await getSignedMediaUrl(mediaId),
          { type, priority }
        );
      });
    } catch (error) {
      console.error('❌ useIntelligentPreload: Error precargando medios específicos:', error);
    }
  }, [enabled]);

  const getCacheMetrics = useCallback(() => {
    try {
      return unifiedMediaCache.getMetrics();
    } catch (error) {
      console.error('❌ useIntelligentPreload: Error obteniendo métricas:', error);
      return {
        totalRequests: 0,
        cacheHits: 0,
        cacheMisses: 0,
        duplicatePrevented: 0,
        totalBytesServed: 0,
        totalBytesSaved: 0,
        preloadHits: 0
      };
    }
  }, []);

  return {
    preloadFeedMedia,
    preloadUserAvatars,
    preloadSpecificMedia,
    getCacheMetrics
  };
};
