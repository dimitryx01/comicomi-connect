
import { useQuery } from '@tanstack/react-query';
import { getSignedMediaUrl } from '@/utils/mediaStorage';

// Función para determinar si es una URL pública o un fileId privado
const isPublicUrl = (url: string): boolean => {
  return url.startsWith('http://') || url.startsWith('https://');
};

/**
 * Hook optimizado para URLs firmadas usando React Query para cache avanzado
 */
export const useSignedUrlQuery = (fileId: string | null | undefined) => {
  return useQuery({
    queryKey: ['signedUrl', fileId],
    queryFn: async () => {
      if (!fileId) {
        return null;
      }

      // Si es una URL pública, devolverla directamente
      if (isPublicUrl(fileId)) {
        console.log('🌐 useSignedUrlQuery: Es URL pública, usando directamente:', fileId);
        return fileId;
      }

      console.log('📡 useSignedUrlQuery: Obteniendo URL firmada para fileId privado:', fileId);
      return await getSignedMediaUrl(fileId);
    },
    enabled: !!fileId,
    staleTime: 50 * 60 * 1000, // 50 minutos (las URLs duran 1 hora)
    gcTime: 60 * 60 * 1000, // 1 hora en cache (renamed from cacheTime)
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
