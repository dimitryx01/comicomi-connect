
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
 * Hook optimizado para URLs firmadas con renovación automática para errores 406
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

  console.log('🔍 useUnifiedSignedUrl: Hook llamado con renovación automática:', {
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

      console.log('📡 useUnifiedSignedUrl: Solicitando URL firmada con tiempo extendido:', {
        fileId: sanitizedFileId.substring(0, 30) + '...',
        type,
        priority,
        preload
      });

      try {
        // Usar cache unificado con tiempo de expiración extendido
        const result = await unifiedMediaCache.get(
          sanitizedFileId,
          async () => {
            console.log('🔗 useUnifiedSignedUrl: Generando nueva URL firmada con 65 minutos de validez:', 
              sanitizedFileId.substring(0, 30) + '...');
            // Solicitar URL con 65 minutos de validez (3900 segundos)
            return await getSignedMediaUrl(sanitizedFileId, 3900);
          },
          { type, priority }
        );

        if (result) {
          console.log('✅ useUnifiedSignedUrl: URL firmada obtenida exitosamente:', {
            fileId: sanitizedFileId.substring(0, 30) + '...',
            urlPreview: result.substring(0, 100) + '...',
            hasAuthParam: result.includes('Authorization='),
            estimatedExpiry: new Date(Date.now() + 60 * 60 * 1000).toISOString() // ~1 hora
          });
        }
        
        return result;
      } catch (error) {
        console.error('❌ useUnifiedSignedUrl: Error obteniendo URL firmada:', {
          fileId: sanitizedFileId.substring(0, 30) + '...',
          error: error.message,
          errorType: error.constructor.name
        });
        throw error;
      }
    },
    enabled: shouldFetch,
    staleTime: 50 * 60 * 1000, // 50 minutos (URLs duran 65 minutos)
    gcTime: 70 * 60 * 1000, // 70 minutos en cache de React Query
    retry: (failureCount, error) => {
      // Para errores HTTP específicos, reintentamos hasta 3 veces
      if (error?.message?.includes('406') || error?.message?.includes('401')) {
        console.log(`🔄 useUnifiedSignedUrl: Reintentando debido a error de autorización (${failureCount}/3)`);
        return failureCount < 3;
      }
      // Para otros errores, solo 1 reintento
      return failureCount < 1;
    },
    retryDelay: (attemptIndex, error) => {
      // Para errores 406/401, reintento más rápido
      if (error?.message?.includes('406') || error?.message?.includes('401')) {
        return Math.min(1000 * Math.pow(1.5, attemptIndex), 5000);
      }
      return Math.min(1000 * 2 ** attemptIndex, 30000);
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: true, // Activado para renovar URLs después de reconexión
  });
};
