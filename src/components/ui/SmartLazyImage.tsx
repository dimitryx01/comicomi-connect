
import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useSmartLazyLoad } from '@/hooks/useSmartLazyLoad';
import { useUnifiedSignedUrl } from '@/hooks/useUnifiedSignedUrl';
import { performanceAnalyzer } from '@/utils/performanceAnalyzer';

interface SmartLazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
  threshold?: number;
  enableCancellation?: boolean;
  priority?: 'high' | 'medium' | 'low';
}

export const SmartLazyImage = ({
  src,
  alt,
  className,
  placeholder = '/placeholder.svg',
  onLoad,
  onError,
  threshold = 0.1,
  enableCancellation = true,
  priority = 'medium'
}: SmartLazyImageProps) => {
  const [hasError, setHasError] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Obtener URL firmada si es necesario
  const { data: signedUrl, isLoading: urlLoading } = useUnifiedSignedUrl(
    src,
    {
      enabled: true,
      type: 'media',
      priority
    }
  );

  // Función de carga con análisis de performance
  const loadImage = useCallback(async (signal: AbortSignal) => {
    const startTime = Date.now();
    const imageUrl = signedUrl || src;
    
    console.log('🖼️ SmartLazyImage: Iniciando carga inteligente:', {
      src: src.substring(0, 50) + '...',
      hasSignedUrl: !!signedUrl,
      priority,
      enableCancellation
    });

    return performanceAnalyzer.measureOperation(
      'smart_lazy_image_load',
      async () => {
        return new Promise<void>((resolve, reject) => {
          const img = new Image();
          
          // Manejar cancelación
          signal.addEventListener('abort', () => {
            img.src = ''; // Cancelar descarga
            reject(new Error('Load cancelled'));
          });

          img.onload = () => {
            if (!signal.aborted) {
              setIsImageLoaded(true);
              setHasError(false);
              onLoad?.();
              resolve();
            }
          };

          img.onerror = () => {
            if (!signal.aborted) {
              setHasError(true);
              onError?.();
              reject(new Error('Image load failed'));
            }
          };

          img.src = imageUrl;
        });
      },
      {
        imageUrl: imageUrl?.substring(0, 100),
        priority,
        enableCancellation,
        cacheHit: !!signedUrl
      }
    );
  }, [src, signedUrl, onLoad, onError, priority, enableCancellation]);

  // Hook de lazy loading inteligente
  const {
    elementRef,
    isInView,
    isLoaded,
    isLoading,
    error,
    activeOperationsCount
  } = useSmartLazyLoad(loadImage, {
    threshold,
    enableCancellation,
    loadDelay: priority === 'high' ? 200 : priority === 'medium' ? 500 : 800
  });

  const finalImageUrl = signedUrl || src;
  const showImage = isLoaded && isImageLoaded && !hasError && finalImageUrl;
  const showPlaceholder = !showImage || urlLoading || isLoading;

  return (
    <div ref={elementRef as React.RefObject<HTMLDivElement>} className={cn("relative overflow-hidden", className)}>
      {/* Placeholder mientras carga */}
      {showPlaceholder && (
        <img
          src={placeholder}
          alt="Cargando..."
          className={cn(
            "absolute inset-0 w-full h-full object-cover",
            className
          )}
        />
      )}

      {/* Imagen real - solo se muestra cuando está completamente cargada */}
      {showImage && (
        <img
          src={finalImageUrl}
          alt={alt}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            "opacity-100",
            className
          )}
          loading="lazy"
        />
      )}

      {/* Shimmer effect mientras carga */}
      {(isLoading || urlLoading) && isInView && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
      )}

      {/* Indicador de operaciones activas (solo en desarrollo) */}
      {import.meta.env.DEV && activeOperationsCount > 0 && (
        <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
          {activeOperationsCount}
        </div>
      )}

      {/* Error state */}
      {(hasError || error) && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <span className="text-gray-500 text-sm">Error cargando imagen</span>
        </div>
      )}
    </div>
  );
};
