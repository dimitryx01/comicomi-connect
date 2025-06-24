
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
  enableCancellation = false,
  priority = 'medium',
  maxRetries = 2
}: SmartLazyImageProps) => {
  const [hasError, setHasError] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [detailedError, setDetailedError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Obtener URL firmada si es necesario
  const { data: signedUrl, isLoading: urlLoading, error: urlError } = useUnifiedSignedUrl(
    src,
    {
      enabled: true,
      type: 'media',
      priority
    }
  );

  // Función de carga con logs detallados para diagnóstico
  const loadImage = useCallback(async (signal: AbortSignal) => {
    const startTime = Date.now();
    const imageUrl = signedUrl || src;
    
    // LOGS DETALLADOS PARA DIAGNÓSTICO
    const diagnosticInfo = {
      originalSrc: src.substring(0, 100) + '...',
      finalUrl: imageUrl ? imageUrl.substring(0, 150) + '...' : 'NO URL',
      hasSignedUrl: !!signedUrl,
      urlError: urlError?.message,
      priority,
      retryCount,
      timestamp: new Date().toISOString()
    };
    
    console.log('🔍 DIAGNOSTIC - SmartLazyImage Load Attempt:', diagnosticInfo);
    setDebugInfo(diagnosticInfo);

    if (!imageUrl) {
      const error = `❌ DIAGNOSTIC - No URL disponible: signedUrl=${!!signedUrl}, urlError=${urlError?.message}`;
      console.error(error);
      setDetailedError(error);
      throw new Error(error);
    }

    // Verificar si la URL es accesible manualmente
    console.log('🌐 DIAGNOSTIC - Testing URL accessibility:', imageUrl.substring(0, 200) + '...');
    
    return performanceAnalyzer.measureOperation(
      'smart_lazy_image_load',
      async () => {
        return new Promise<void>((resolve, reject) => {
          const img = new Image();
          
          // Configurar CORS y caching
          img.crossOrigin = 'anonymous';
          img.referrerPolicy = 'no-referrer';
          
          // Timeout más corto para diagnóstico
          const timeout = setTimeout(() => {
            if (!signal.aborted) {
              const timeoutError = `⏱️ DIAGNOSTIC - Timeout después de 10 segundos. URL: ${imageUrl.substring(0, 150)}`;
              console.error(timeoutError);
              setDetailedError(timeoutError);
              reject(new Error(timeoutError));
            }
          }, 10000);

          // Manejar cancelación
          signal.addEventListener('abort', () => {
            clearTimeout(timeout);
            img.src = '';
            console.log('🚫 DIAGNOSTIC - Carga cancelada por signal');
            reject(new Error('Load cancelled'));
          });

          img.onload = () => {
            clearTimeout(timeout);
            if (!signal.aborted) {
              const successInfo = {
                duration: Date.now() - startTime,
                naturalWidth: img.naturalWidth,
                naturalHeight: img.naturalHeight,
                complete: img.complete,
                currentSrc: img.currentSrc?.substring(0, 150) + '...'
              };
              console.log('✅ DIAGNOSTIC - Imagen cargada exitosamente:', successInfo);
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
              // LOGS DETALLADOS DEL ERROR
              const errorInfo = {
                event: event,
                imageSrc: img.src?.substring(0, 150) + '...',
                imageComplete: img.complete,
                imageNaturalWidth: img.naturalWidth,
                imageNaturalHeight: img.naturalHeight,
                duration: Date.now() - startTime,
                retryCount,
                userAgent: navigator.userAgent,
                online: navigator.onLine
              };
              
              console.error('❌ DIAGNOSTIC - Error detallado cargando imagen:', errorInfo);
              
              // Intentar fetch manual para más información
              fetch(imageUrl, { 
                method: 'HEAD',
                mode: 'cors'
              })
              .then(response => {
                console.log('🔍 DIAGNOSTIC - Fetch HEAD response:', {
                  status: response.status,
                  statusText: response.statusText,
                  headers: Object.fromEntries(response.headers.entries()),
                  url: response.url?.substring(0, 150) + '...',
                  ok: response.ok,
                  redirected: response.redirected
                });
              })
              .catch(fetchError => {
                console.error('❌ DIAGNOSTIC - Fetch HEAD error:', fetchError);
              });
              
              // Intentar reintento si no hemos alcanzado el máximo
              if (retryCount < maxRetries) {
                console.log(`🔄 DIAGNOSTIC - Reintentando carga (${retryCount + 1}/${maxRetries})`);
                setRetryCount(prev => prev + 1);
                
                // Reintento con delay exponencial y cache-busting
                setTimeout(() => {
                  if (!signal.aborted) {
                    const cacheBustedUrl = imageUrl + (imageUrl.includes('?') ? '&' : '?') + `retry=${retryCount + 1}&t=${Date.now()}`;
                    console.log('🔄 DIAGNOSTIC - URL con cache-busting:', cacheBustedUrl.substring(0, 200) + '...');
                    img.src = cacheBustedUrl;
                  }
                }, Math.pow(2, retryCount) * 1000);
                return;
              }
              
              const detailedErrorMsg = `Error de imagen: ${JSON.stringify(errorInfo)}`;
              setDetailedError(detailedErrorMsg);
              setHasError(true);
              onError?.();
              reject(new Error(detailedErrorMsg));
            }
          };

          // Iniciar carga
          console.log('🚀 DIAGNOSTIC - Iniciando carga de imagen:', imageUrl.substring(0, 200) + '...');
          img.src = imageUrl;
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

  // Hook de lazy loading - TEMPORALMENTE DESHABILITADO PARA DIAGNÓSTICO
  const {
    elementRef,
    isInView,
    isLoaded,
    isLoading,
    error,
    forceLoad
  } = useSmartLazyLoad(loadImage, {
    threshold,
    enableCancellation: false, // Deshabilitado para diagnóstico
    loadDelay: 50 // Reducido para diagnóstico más rápido
  });

  const finalImageUrl = signedUrl || src;
  const showImage = isLoaded && isImageLoaded && !hasError && finalImageUrl;
  const showPlaceholder = !showImage || urlLoading || isLoading;
  const showError = hasError || error || urlError;

  // DIAGNÓSTICO: Log del estado del componente
  console.log('📊 DIAGNOSTIC - SmartLazyImage State:', {
    src: src.substring(0, 50) + '...',
    hasSignedUrl: !!signedUrl,
    urlLoading,
    urlError: !!urlError,
    isInView,
    isLoaded,
    isLoading,
    isImageLoaded,
    hasError,
    showImage,
    showPlaceholder,
    showError,
    retryCount
  });

  return (
    <div ref={elementRef as React.RefObject<HTMLDivElement>} className={cn("relative overflow-hidden", className)}>
      {/* PLACEHOLDER TEMPORAL PARA DIAGNÓSTICO */}
      {showPlaceholder && !showError && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <div className="text-center p-4">
            <div className="text-sm text-gray-600 mb-2">Cargando imagen...</div>
            {import.meta.env.DEV && (
              <div className="text-xs text-gray-500">
                {isLoading ? 'Loading...' : urlLoading ? 'Getting URL...' : 'Waiting...'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* IMAGEN REAL */}
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
          onLoad={() => {
            console.log('✅ DIAGNOSTIC - IMG onLoad triggered for:', finalImageUrl.substring(0, 100) + '...');
          }}
          onError={(e) => {
            console.error('❌ DIAGNOSTIC - IMG onError triggered:', e);
          }}
        />
      )}

      {/* SHIMMER EFFECT */}
      {(isLoading || urlLoading) && isInView && !showError && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
      )}

      {/* INDICADORES DE DEBUG EN DESARROLLO */}
      {import.meta.env.DEV && (
        <>
          {retryCount > 0 && (
            <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-1 py-0.5 rounded">
              Retry {retryCount}
            </div>
          )}
          
          {debugInfo && (
            <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
              {debugInfo.hasSignedUrl ? 'Signed' : 'Direct'}
            </div>
          )}
          
          <button 
            onClick={forceLoad}
            className="absolute top-2 right-2 bg-green-500 text-white text-xs px-1 py-0.5 rounded hover:bg-green-600"
          >
            Force Load
          </button>
        </>
      )}

      {/* ERROR STATE MEJORADO PARA DIAGNÓSTICO */}
      {showError && (
        <div className="absolute inset-0 bg-red-50 border-2 border-red-200 flex flex-col items-center justify-center p-4 text-center">
          <span className="text-red-600 text-sm mb-2">❌ Error cargando imagen</span>
          {retryCount < maxRetries && (
            <button 
              onClick={() => setRetryCount(prev => prev + 1)}
              className="text-blue-500 text-xs hover:underline mb-2"
            >
              🔄 Reintentar ({retryCount + 1}/{maxRetries})
            </button>
          )}
          <button
            onClick={forceLoad}
            className="text-green-600 text-xs hover:underline mb-2"
          >
            🚀 Forzar carga
          </button>
          {import.meta.env.DEV && debugInfo && (
            <details className="mt-2 text-xs text-red-600 max-w-full">
              <summary className="cursor-pointer">🔍 Info de diagnóstico</summary>
              <pre className="mt-1 whitespace-pre-wrap text-left overflow-auto max-h-32">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
              {detailedError && (
                <pre className="mt-1 whitespace-pre-wrap text-left overflow-auto max-h-32 bg-red-100 p-2 rounded">
                  {detailedError}
                </pre>
              )}
            </details>
          )}
        </div>
      )}
    </div>
  );
};
