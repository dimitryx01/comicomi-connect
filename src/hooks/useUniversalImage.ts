
import { useState, useEffect, useCallback } from 'react';
import { universalImageCache } from '@/utils/UniversalImageCache';

interface UseUniversalImageResult {
  imageUrl: string | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook para usar el sistema de cache universal de imágenes
 * 
 * @param fileId - ID del archivo a cargar
 * @param fetchFunction - Función para obtener la URL firmada
 * @param options - Opciones adicionales
 * 
 * @returns {UseUniversalImageResult} Estado de la imagen
 * 
 * Ejemplo de uso:
 * ```typescript
 * const { imageUrl, loading, error, refetch } = useUniversalImage(
 *   'posts/images/123.jpg',
 *   () => getSignedUrl('posts/images/123.jpg')
 * );
 * ```
 */
export const useUniversalImage = (
  fileId: string | null | undefined,
  fetchFunction: () => Promise<string>,
  options: {
    enabled?: boolean;
  } = {}
): UseUniversalImageResult => {
  const { enabled = true } = options;
  
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const shouldQuery = Boolean(
    fileId && 
    fileId.trim() && 
    fileId !== 'undefined' && 
    enabled
  );

  console.log('🎣 useUniversalImage: Hook inicializado:', {
    fileId: fileId ? fileId.substring(0, 30) + '...' : 'no fileId',
    shouldQuery,
    enabled,
    currentImageUrl: imageUrl ? 'URL_AVAILABLE' : 'NO_URL'
  });

  const loadImage = useCallback(async () => {
    if (!shouldQuery || !fileId) {
      setImageUrl(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 useUniversalImage: Cargando imagen...', {
        fileId: fileId.substring(0, 30) + '...'
      });

      const url = await universalImageCache.getImage(fileId, fetchFunction);
      
      setImageUrl(url);
      setLoading(false);
      
      console.log('✅ useUniversalImage: Imagen cargada exitosamente:', {
        fileId: fileId.substring(0, 30) + '...',
        hasUrl: !!url
      });
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido');
      
      console.error('❌ useUniversalImage: Error cargando imagen:', {
        fileId: fileId ? fileId.substring(0, 30) + '...' : 'no fileId',
        error: error.message
      });
      
      setError(error);
      setImageUrl(null);
      setLoading(false);
    }
  }, [fileId, shouldQuery, fetchFunction]);

  const refetch = useCallback(() => {
    loadImage();
  }, [loadImage]);

  useEffect(() => {
    loadImage();
  }, [loadImage]);

  // Cleanup de URLs cuando el componente se desmonta o cambia el fileId
  useEffect(() => {
    return () => {
      if (imageUrl && imageUrl.startsWith('blob:')) {
        // No revocar URLs del cache, ya que pueden estar siendo usadas por otros componentes
        console.log('🧹 useUniversalImage: Componente desmontado, URL mantenida en cache');
      }
    };
  }, [imageUrl]);

  return {
    imageUrl,
    loading,
    error,
    refetch
  };
};
