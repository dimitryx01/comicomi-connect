
import { useEffect, useCallback } from 'react';
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

  const preloadFeedMedia = useCallback(() => {
    if (!enabled || !feedItems || feedItems.length === 0) {
      return;
    }

    console.log('🎯 useIntelligentPreload: Iniciando precarga inteligente:', {
      totalItems: feedItems.length,
      preloadDistance,
      priorityThreshold
    });

    // Preparar datos para precarga
    const itemsToPreload = feedItems.slice(0, preloadDistance).map((item, index) => ({
      images: item.images || [],
      videos: item.videos || [],
      authorAvatar: item.authorAvatar,
      priority: index < priorityThreshold ? 'high' as const : 
                index < priorityThreshold * 2 ? 'medium' as const : 'low' as const
    }));

    // Usar el sistema de precarga del cache unificado
    unifiedMediaCache.preloadFeedMedia(
      itemsToPreload,
      async (fileId: string) => {
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

  }, [feedItems, enabled, preloadDistance, priorityThreshold]);

  // Precargar cuando cambie el feed
  useEffect(() => {
    const timer = setTimeout(preloadFeedMedia, 500); // Pequeño delay para no bloquear UI
    return () => clearTimeout(timer);
  }, [preloadFeedMedia]);

  // Precargar avatares de usuarios específicos (por ejemplo, usuarios seguidos)
  const preloadUserAvatars = useCallback((userIds: string[]) => {
    if (!enabled) return;

    console.log('👥 useIntelligentPreload: Precargando avatares de usuarios:', {
      userCount: userIds.length
    });

    userIds.forEach(userId => {
      // Asumir que el avatar está en una ruta específica
      const avatarFileId = `avatars/${userId}`;
      
      unifiedMediaCache.addToPreloadQueue(
        avatarFileId,
        async () => await getSignedMediaUrl(avatarFileId),
        { type: 'avatar', priority: 'high' }
      );
    });
  }, [enabled]);

  // Precargar medios específicos con prioridad
  const preloadSpecificMedia = useCallback((
    mediaIds: string[], 
    type: 'avatar' | 'media' = 'media',
    priority: 'high' | 'medium' | 'low' = 'medium'
  ) => {
    if (!enabled) return;

    console.log('📁 useIntelligentPreload: Precargando medios específicos:', {
      mediaCount: mediaIds.length,
      type,
      priority
    });

    mediaIds.forEach(mediaId => {
      unifiedMediaCache.addToPreloadQueue(
        mediaId,
        async () => await getSignedMediaUrl(mediaId),
        { type, priority }
      );
    });
  }, [enabled]);

  return {
    preloadFeedMedia,
    preloadUserAvatars,
    preloadSpecificMedia,
    getCacheMetrics: () => unifiedMediaCache.getMetrics()
  };
};
