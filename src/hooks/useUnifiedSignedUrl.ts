
import { useQuery } from '@tanstack/react-query';
import { getSignedMediaUrl } from '@/utils/mediaStorage';
import { unifiedMediaCache } from '@/utils/unifiedMediaCache';

// Función para determinar si es una URL pública o un fileId privado
const isPublicUrl = (url: string): boolean => {
  return url.startsWith('http://') || url.startsWith('https://');
};

interface UseUnifiedSignedUrlOptions {
  enabled?: boolean;
  type?: 'avatar' | 'media' | 'general';
  priority?: 'high' | 'medium' | 'low';
  preload?: boolean;
}

/**
 * Hook optimizado para URLs firmadas usando el cache unificado para máxima eficiencia
 * Reduce transacciones Clase B mediante cache inteligente y downloading locks
 */
export const useUnifiedSignedUrl = (
  fileId: string | null | undefined, 
  options?: UseUnifiedSignedUrlOptions
) => {
  const { 
    enabled = true, 
    type = 'general', 
    priority = 'medium',
    preload = false 
  } = options || {};

  // Sanitizar fileId para evitar bucles
  const sanitizedFileId = fileId?.trim();
  const shouldFetch = Boolean(enabled && sanitizedFileId && sanitizedFileId !== 'undefined' && sanitizedFileId !== 'null');

  console.log('🔍 useUnifiedSignedUrl: Hook llamado con:', {
    fileId: sanitizedFileId ? sanitizedFileId.substring(0, 30) + '...' : 'no fileId',
    enabled,
    shouldFetch,
    type,
    priority
  });

  return useQuery({
    queryKey: ['unifiedSignedUrl', sanitizedFileId, type],
    queryFn: async () => {
      if (!sanitizedFileId) {
        console.log('⚠️ useUnifiedSignedUrl: No fileId proporcionado');
        return null;
      }

      // Si es una URL pública, devolverla directamente
      if (isPublicUrl(sanitizedFileId)) {
        console.log('🌐 useUnifiedSignedUrl: Es URL pública, usando directamente:', 
          sanitizedFileId.substring(0, 50) + '...');
        return sanitizedFileId;
      }

      console.log('📡 useUnifiedSignedUrl: Solicitando URL firmada con cache unificado:', {
        fileId: sanitizedFileId.substring(0, 30) + '...',
        type,
        priority,
        preload
      });

      try {
        // Usar cache unificado con downloading locks
        const result = await unifiedMediaCache.get(
          sanitizedFileId,
          async () => {
            console.log('🔗 useUnifiedSignedUrl: Generando nueva URL firmada para:', 
              sanitizedFileId.substring(0, 30) + '...');
            return await getSignedMediaUrl(sanitizedFileId);
          },
          { type, priority }
        );

        console.log('✅ useUnifiedSignedUrl: URL obtenida exitosamente:', 
          result ? result.substring(0, 50) + '...' : 'null');
        
        return result;
      } catch (error) {
        console.error('❌ useUnifiedSignedUrl: Error obteniendo URL:', error);
        throw error;
      }
    },
    enabled: shouldFetch,
    staleTime: 45 * 60 * 1000, // 45 minutos (URLs duran 1 hora)
    gcTime: 60 * 60 * 1000, // 1 hora en cache de React Query
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false, // Evitar refetch innecesarios
    refetchOnReconnect: false,   // Evitar refetch innecesarios
  });
};
