
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

  return useQuery({
    queryKey: ['unifiedSignedUrl', fileId, type],
    queryFn: async () => {
      if (!fileId) {
        return null;
      }

      // Si es una URL pública, devolverla directamente
      if (isPublicUrl(fileId)) {
        console.log('🌐 useUnifiedSignedUrl: Es URL pública, usando directamente:', 
          fileId.substring(0, 50) + '...');
        return fileId;
      }

      console.log('📡 useUnifiedSignedUrl: Solicitando URL firmada con cache unificado:', {
        fileId: fileId.substring(0, 30) + '...',
        type,
        priority,
        preload
      });

      // Usar cache unificado con downloading locks
      return await unifiedMediaCache.get(
        fileId,
        async () => {
          console.log('🔗 useUnifiedSignedUrl: Generando nueva URL firmada para:', 
            fileId.substring(0, 30) + '...');
          return await getSignedMediaUrl(fileId);
        },
        { type, priority }
      );
    },
    enabled: enabled && !!fileId,
    staleTime: 45 * 60 * 1000, // 45 minutos (URLs duran 1 hora)
    gcTime: 60 * 60 * 1000, // 1 hora en cache de React Query
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
