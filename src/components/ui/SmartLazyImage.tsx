
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
  maxRetries?: number;
}

export const SmartLazyImage = ({
  src,
  alt,
  className,
  placeholder = '/placeholder.svg',
  onLoad,
  onError,
  threshold = 0.1,
  enableCancellation = false, // Deshabilitado por defecto para evitar cancelaciones prematuras
  priority = 'medium',
  maxRetries = 2
}: SmartLazyImageProps) => {
  const [hasError, setHasError] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [detailedError, setDetailedError] = useState<string | null>(null);

  // Obtener URL firmada si es necesario
  const { data: signedUrl, isLoading: urlLoading, error: urlError } = useUnifiedSignedUrl(
    src,
    {
      enabled: true,
      type: 'media',
      priority
    }
  );

  // Función de carga con análisis de performance y manejo robusto de errores
  const loadImage = useCallback(async (signal: AbortSignal) => {
    const startTime = Date.now();
    const imageUrl = signedUrl || src;
    
    console.log('🖼️ SmartLazyImage: Iniciando carga con análisis detallado:', {
      src: src.substring(0, 50) + '...',
      finalUrl: imageUrl ? imageUrl.substring(0, 100) + '...' : 'no url',
      hasSignedUrl: !!signedUrl,
      priority,
      enableCancellation,
      retryCount,
      urlError: !!urlError
    });

    if (!imageUrl) {
      const error = `No se pudo obtener URL válida. URL Error: ${urlError?.message || 'unknown'}`;
      console.error('❌ SmartLazyImage: Error de URL:', {
        src: src.substring(0, 50) + '...',
        signedUrl: !!signedUrl,
        urlError,
        error
      });
      setDetailedError(error);
      throw new Error(error);
    }

    return performanceAnalyzer.measureOperation(
      'smart_lazy_image_load',
      async () => {
        return new Promise<void>((resolve, reject) => {
          const img = new Image();
          
          // Configurar CORS y caching
          img.crossOrigin = 'anonymous';
          img.referrerPolicy = 'no-referrer';
          
          // Timeout para evitar cargas infinitas
          const timeout = setTimeout(() => {
            if (!signal.aborted) {
              const timeoutError = `Timeout después de 15 segundos cargando imagen`;
              console.error('⏱️ SmartLazyImage: Timeout:', {
                imageUrl: imageUrl.substring(0, 100) + '...',
                duration: Date.now() - startTime
              });
              setDetailedError(timeoutError);
              reject(new Error(timeoutError));
            }
          }, 15000);

          // Manejar cancelación
          signal.addEventListener('abort', () => {
            clearTimeout(timeout);
            img.src = ''; // Cancelar descarga
            console.log('🚫 SmartLazyImage: Carga cancelada por signal');
            reject(new Error('Load cancelled'));
          });

          img.onload = () => {
            clearTimeout(timeout);
            if (!signal.aborted) {
              console.log('✅ SmartLazyImage: Imagen cargada exitosamente:', {
                src: src.substring(0, 50) + '...',
                finalUrl: imageUrl.substring(0, 100) + '...',
                duration: Date.now() - startTime,
                naturalWidth: img.naturalWidth,
                naturalHeight: img.naturalHeight
              });
              setIsImageLoaded(true);
              setHasError(false);
              setDetailedError(null);
              onLoad?.();
              resolve();
            }
          };

          img.onerror = (event) => {
            clearTimeout(timeout);
            if (!signal.aborted) {
              const errorDetails = {
                src: src.substring(0, 50) + '...',
                finalUrl: imageUrl.substring(0, 100) + '...',
                duration: Date.now() - startTime,
                retryCount,
                event: event,
                imageComplete: img.complete,
                imageNaturalWidth: img.naturalWidth
              };
              
              console.error('❌ SmartLazyImage: Error cargando imagen:', errorDetails);
              
              // Intentar reintento si no hemos alcanzado el máximo
              if (retryCount < maxRetries) {
                console.log(`🔄 SmartLazyImage: Reintentando carga (${retryCount + 1}/${maxRetries}):`, {
                  src: src.substring(0, 50) + '...'
                });
                setRetryCount(prev => prev + 1);
                
                // Reintento con delay exponencial
                setTimeout(() => {
                  if (!signal.aborted) {
                    img.src = imageUrl + (imageUrl.includes('?') ? '&' : '?') + `retry=${retryCount + 1}&t=${Date.now()}`;
                  }
                }, Math.pow(2, retryCount) * 1000);
                return;
              }
              
              const detailedErrorMsg = `Error de red o URL inválida. Detalles: ${JSON.stringify(errorDetails)}`;
              setDetailedError(detailedErrorMsg);
              setHasError(true);
              onError?.();
              reject(new Error(detailedErrorMsg));
            }
          };

          // Iniciar carga con cache-busting si es un reintento
          const finalUrlWithParams = retryCount > 0 
            ? imageUrl + (imageUrl.includes('?') ? '&' : '?') + `retry=${retryCount}&t=${Date.now()}`
            : imageUrl;
          
          img.src = finalUrlWithParams;
        });
      },
      {
        imageUrl: imageUrl?.substring(0, 100),
        priority,
        enableCancellation,
        cacheHit: !!signedUrl,
        retryCount,
        hasError: hasError
      }
    );
  }, [src, signedUrl, onLoad, onError, priority, enableCancellation, retryCount, maxRetries, urlError]);

  // Hook de lazy loading con configuración más permisiva
  const {
    elementRef,
    isInView,
    isLoaded,
    isLoading,
    error,
    activeOperationsCount
  } = useSmartLazyLoad(loadImage, {
    threshold,
    enableCancellation: false, // Deshabilitado para evitar cancelaciones prematuras
    loadDelay: 100 // Delay mínimo para mejor responsividad
  });

  const finalImageUrl = signedUrl || src;
  const showImage = isLoaded && isImageLoaded && !hasError && finalImageUrl;
  const showPlaceholder = !showImage || urlLoading || isLoading;
  const showError = hasError || error || urlError;

  return (
    <div ref={elementRef as React.RefObject<HTMLDivElement>} className={cn("relative overflow-hidden", className)}>
      {/* Placeholder mientras carga */}
      {showPlaceholder && !showError && (
        <img
          src={placeholder}
          alt="Cargando..."
          className={cn(
            "absolute inset-0 w-full h-full object-cover opacity-50",
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
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      )}

      {/* Shimmer effect mientras carga */}
      {(isLoading || urlLoading) && isInView && !showError && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
      )}

      {/* Indicador de reintentos (solo en desarrollo) */}
      {import.meta.env.DEV && retryCount > 0 && (
        <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-1 py-0.5 rounded">
          Retry {retryCount}
        </div>
      )}

      {/* Indicador de operaciones activas (solo en desarrollo) */}
      {import.meta.env.DEV && activeOperationsCount > 0 && (
        <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
          {activeOperationsCount}
        </div>
      )}

      {/* Error state mejorado con detalles */}
      {showError && (
        <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center p-4 text-center">
          <span className="text-gray-500 text-sm mb-2">Error cargando imagen</span>
          {retryCount < maxRetries && (
            <button 
              onClick={() => setRetryCount(prev => prev + 1)}
              className="text-blue-500 text-xs hover:underline"
            >
              Reintentar
            </button>
          )}
          {import.meta.env.DEV && detailedError && (
            <details className="mt-2 text-xs text-red-600">
              <summary>Detalles del error</summary>
              <pre className="mt-1 whitespace-pre-wrap">{detailedError}</pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
};
