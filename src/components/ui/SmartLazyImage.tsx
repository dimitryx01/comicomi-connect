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

interface ManualTestResults {
  headStatus?: number;
  getStatus?: number;
  success: boolean;
  error?: string;
  contentType?: string;
  timestamp: string;
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
  maxRetries = 3
}: SmartLazyImageProps) => {
  const [hasError, setHasError] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [detailedError, setDetailedError] = useState<string | null>(null);
  const [urlRenewalCount, setUrlRenewalCount] = useState(0);
  const [manualTestResults, setManualTestResults] = useState<ManualTestResults | null>(null);

  // Obtener URL firmada con cache
  const { data: signedUrl, isLoading: urlLoading, error: urlError, refetch } = useUnifiedSignedUrl(
    src,
    {
      enabled: true,
      type: 'media',
      priority
    }
  );

  // Función para probar manualmente la URL
  const testUrlManually = useCallback(async () => {
    const imageUrl = signedUrl || src;
    console.log('🧪 PRUEBA MANUAL: Iniciando test de URL:', imageUrl.substring(0, 100) + '...');
    
    try {
      // Prueba 1: HEAD request para verificar headers
      const headResponse = await fetch(imageUrl, { 
        method: 'HEAD',
        mode: 'cors',
        cache: 'no-cache'
      });
      
      console.log('📊 PRUEBA MANUAL - HEAD Response:', {
        status: headResponse.status,
        statusText: headResponse.statusText,
        headers: Object.fromEntries(headResponse.headers.entries()),
        url: headResponse.url?.substring(0, 100) + '...'
      });

      // Prueba 2: GET request simple
      const getResponse = await fetch(imageUrl, { 
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache'
      });

      console.log('📊 PRUEBA MANUAL - GET Response:', {
        status: getResponse.status,
        statusText: getResponse.statusText,
        contentType: getResponse.headers.get('content-type'),
        contentLength: getResponse.headers.get('content-length'),
        headers: Object.fromEntries(getResponse.headers.entries())
      });

      const testResults: ManualTestResults = {
        headStatus: headResponse.status,
        getStatus: getResponse.status,
        success: headResponse.ok && getResponse.ok,
        error: !headResponse.ok ? `HEAD: ${headResponse.status}` : !getResponse.ok ? `GET: ${getResponse.status}` : undefined,
        contentType: getResponse.headers.get('content-type') || undefined,
        timestamp: new Date().toISOString()
      };

      setManualTestResults(testResults);
      return testResults;

    } catch (error) {
      console.error('❌ PRUEBA MANUAL - Error:', error);
      const testResults: ManualTestResults = {
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
        timestamp: new Date().toISOString()
      };
      setManualTestResults(testResults);
      return testResults;
    }
  }, [signedUrl, src]);

  // Función para renovar URL firmada cuando hay Error 406
  const renewSignedUrl = useCallback(async () => {
    console.log('🔄 SmartLazyImage: Renovando URL firmada debido a Error 406:', {
      originalSrc: src.substring(0, 50) + '...',
      urlRenewalCount,
      timestamp: new Date().toISOString()
    });
    
    setUrlRenewalCount(prev => prev + 1);
    await refetch();
  }, [src, refetch, urlRenewalCount]);

  // Función de carga con manejo específico de Error 406
  const loadImage = useCallback(async (signal: AbortSignal) => {
    const startTime = Date.now();
    const imageUrl = signedUrl || src;
    
    console.log('🚀 SmartLazyImage: Iniciando carga con URL firmada:', {
      originalSrc: src.substring(0, 50) + '...',
      finalUrl: imageUrl ? imageUrl.substring(0, 100) + '...' : 'NO URL',
      hasSignedUrl: !!signedUrl,
      urlError: urlError?.message,
      priority,
      retryCount,
      urlRenewalCount,
      timestamp: new Date().toISOString()
    });

    if (!imageUrl) {
      const error = `❌ No URL disponible: signedUrl=${!!signedUrl}, urlError=${urlError?.message}`;
      console.error(error);
      setDetailedError(error);
      throw new Error(error);
    }

    // Verificar si la URL es válida antes de intentar cargar
    console.log('🔍 SmartLazyImage: Verificando accesibilidad de URL:', {
      url: imageUrl.substring(0, 150) + '...',
      hasAuthParam: imageUrl.includes('Authorization')
    });

    return performanceAnalyzer.measureOperation(
      'smart_lazy_image_load',
      async () => {
        return new Promise<void>((resolve, reject) => {
          const img = new Image();
          
          // DIAGNÓSTICO: Sin headers personalizados para evitar 406
          // img.crossOrigin = 'anonymous'; // COMENTADO PARA PRUEBA
          // img.referrerPolicy = 'no-referrer'; // COMENTADO PARA PRUEBA
          
          // Timeout más largo para URLs firmadas
          const timeout = setTimeout(() => {
            if (!signal.aborted) {
              const timeoutError = `⏱️ Timeout después de 15 segundos. URL: ${imageUrl.substring(0, 100)}`;
              console.error(timeoutError);
              setDetailedError(timeoutError);
              reject(new Error(timeoutError));
            }
          }, 15000);

          // Manejar cancelación
          signal.addEventListener('abort', () => {
            clearTimeout(timeout);
            img.src = '';
            console.log('🚫 Carga cancelada por signal');
            reject(new Error('Load cancelled'));
          });

          img.onload = () => {
            clearTimeout(timeout);
            if (!signal.aborted) {
              const successInfo = {
                duration: Date.now() - startTime,
                naturalWidth: img.naturalWidth,
                naturalHeight: img.naturalHeight,
                urlRenewalCount
              };
              console.log('✅ SmartLazyImage: Imagen cargada exitosamente:', successInfo);
              setIsImageLoaded(true);
              setHasError(false);
              setDetailedError(null);
              onLoad?.();
              resolve();
            }
          };

          img.onerror = async (event) => {
            clearTimeout(timeout);
            if (!signal.aborted) {
              console.log('❌ SmartLazyImage: Error en imagen, iniciando diagnóstico detallado...');
              
              // DIAGNÓSTICO DETALLADO DEL ERROR 406
              try {
                // Hacer prueba manual de la URL
                const testResults = await testUrlManually();
                
                const errorInfo = {
                  imageUrl: imageUrl.substring(0, 100) + '...',
                  duration: Date.now() - startTime,
                  retryCount,
                  urlRenewalCount,
                  manualTestResults: testResults
                };
                
                console.error('❌ SmartLazyImage: DIAGNÓSTICO COMPLETO DEL ERROR:', errorInfo);
                
                // Si la prueba manual también falló, es problema de backend
                if (testResults && !testResults.success) {
                  if ((testResults.headStatus && testResults.headStatus === 406) || (testResults.getStatus && testResults.getStatus === 406)) {
                    console.log('🔄 SmartLazyImage: Error 406 confirmado en prueba manual');
                    
                    // Si no hemos renovado demasiadas veces, intentar renovar la URL
                    if (urlRenewalCount < 2) {
                      console.log('🔄 Intentando renovar URL firmada...');
                      try {
                        await renewSignedUrl();
                        // Después de renovar, reintentar la carga
                        setTimeout(() => {
                          if (!signal.aborted) {
                            console.log('🔄 Reintentando carga con URL renovada...');
                            img.src = signedUrl || src;
                          }
                        }, 1000);
                        return;
                      } catch (renewError) {
                        console.error('❌ Error renovando URL:', renewError);
                      }
                    }
                  }
                }
                
                // Para otros errores, intentar reintento normal
                if (retryCount < maxRetries) {
                  console.log(`🔄 Reintentando carga (${retryCount + 1}/${maxRetries})`);
                  setRetryCount(prev => prev + 1);
                  
                  setTimeout(() => {
                    if (!signal.aborted) {
                      img.src = imageUrl + (imageUrl.includes('?') ? '&' : '?') + `retry=${retryCount + 1}&t=${Date.now()}`;
                    }
                  }, Math.pow(2, retryCount) * 1000);
                  return;
                }
                
                const detailedErrorMsg = `Error de imagen. Prueba manual: ${JSON.stringify(testResults)}`;
                setDetailedError(detailedErrorMsg);
                
              } catch (fetchError) {
                console.error('❌ SmartLazyImage: Error en diagnóstico:', fetchError);
                const networkErrorMsg = `Error de red: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`;
                setDetailedError(networkErrorMsg);
              }
              
              setHasError(true);
              onError?.();
              reject(new Error('Image load failed'));
            }
          };

          // Iniciar carga SIN headers personalizados (para evitar 406)
          console.log('🎯 SmartLazyImage: Iniciando carga de imagen SIN headers personalizados:', {
            url: imageUrl.substring(0, 100) + '...',
            hasAuth: imageUrl.includes('Authorization'),
            timestamp: new Date().toISOString()
          });
          img.src = imageUrl;
        });
      },
      {
        imageUrl: imageUrl?.substring(0, 100),
        priority,
        enableCancellation,
        cacheHit: !!signedUrl,
        retryCount,
        urlRenewalCount,
        hasError: hasError
      }
    );
  }, [src, signedUrl, onLoad, onError, priority, enableCancellation, retryCount, maxRetries, urlError, urlRenewalCount, renewSignedUrl, testUrlManually]);

  // Hook de lazy loading
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
    loadDelay: 100
  });

  const finalImageUrl = signedUrl || src;
  const showImage = isLoaded && isImageLoaded && !hasError && finalImageUrl;
  const showPlaceholder = !showImage || urlLoading || isLoading;
  const showError = hasError || error || urlError;

  // Log del estado del componente
  console.log('📊 SmartLazyImage: Estado actual:', {
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
    retryCount,
    urlRenewalCount,
    manualTestResults
  });

  return (
    <div ref={elementRef as React.RefObject<HTMLDivElement>} className={cn("relative overflow-hidden", className)}>
      {/* PLACEHOLDER */}
      {showPlaceholder && !showError && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <div className="text-center p-4">
            <div className="text-sm text-gray-600 mb-2">
              {urlLoading ? 'Obteniendo URL firmada...' : isLoading ? 'Cargando imagen...' : 'Preparando...'}
            </div>
            {import.meta.env.DEV && (
              <div className="text-xs text-gray-500">
                Reintentos: {retryCount} | URL renovada: {urlRenewalCount}x
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
          onLoad={() => {
            console.log('✅ IMG onLoad final triggered:', finalImageUrl.substring(0, 100) + '...');
          }}
          onError={(e) => {
            console.error('❌ IMG onError final triggered:', e);
          }}
        />
      )}

      {/* SHIMMER EFFECT */}
      {(isLoading || urlLoading) && isInView && !showError && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
      )}

      {/* INDICADORES DE DEBUG */}
      {import.meta.env.DEV && (
        <>
          {retryCount > 0 && (
            <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-1 py-0.5 rounded">
              Retry {retryCount}
            </div>
          )}
          
          {urlRenewalCount > 0 && (
            <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
              Renewed {urlRenewalCount}x
            </div>
          )}
          
          <button 
            onClick={forceLoad}
            className="absolute bottom-2 right-2 bg-green-500 text-white text-xs px-1 py-0.5 rounded hover:bg-green-600"
          >
            Force Load
          </button>
          
          <button 
            onClick={renewSignedUrl}
            className="absolute bottom-8 right-2 bg-purple-500 text-white text-xs px-1 py-0.5 rounded hover:bg-purple-600"
          >
            Renew URL
          </button>

          <button 
            onClick={testUrlManually}
            className="absolute bottom-14 right-2 bg-orange-500 text-white text-xs px-1 py-0.5 rounded hover:bg-orange-600"
          >
            Test URL
          </button>
        </>
      )}

      {/* ERROR STATE MEJORADO */}
      {showError && (
        <div className="absolute inset-0 bg-red-50 border-2 border-red-200 flex flex-col items-center justify-center p-4 text-center">
          <span className="text-red-600 text-sm mb-2">❌ Error cargando imagen</span>
          
          {import.meta.env.DEV && manualTestResults && (
            <div className="text-xs text-gray-600 mb-2 bg-gray-100 p-2 rounded max-w-full overflow-auto">
              Prueba manual: {manualTestResults.success ? '✅' : '❌'} 
              {manualTestResults.error && ` - ${manualTestResults.error}`}
            </div>
          )}
          
          {retryCount < maxRetries && (
            <button 
              onClick={() => setRetryCount(prev => prev + 1)}
              className="text-blue-500 text-xs hover:underline mb-2"
            >
              🔄 Reintentar ({retryCount + 1}/{maxRetries})
            </button>
          )}
          <button
            onClick={renewSignedUrl}
            className="text-purple-600 text-xs hover:underline mb-2"
          >
            🔄 Renovar URL
          </button>
          <button
            onClick={forceLoad}
            className="text-green-600 text-xs hover:underline mb-2"
          >
            🚀 Forzar carga
          </button>
          <button
            onClick={testUrlManually}
            className="text-orange-600 text-xs hover:underline mb-2"
          >
            🧪 Test manual
          </button>
          {import.meta.env.DEV && detailedError && (
            <details className="mt-2 text-xs text-red-600 max-w-full">
              <summary className="cursor-pointer">🔍 Error detallado</summary>
              <pre className="mt-1 whitespace-pre-wrap text-left overflow-auto max-h-32 bg-red-100 p-2 rounded">
                {detailedError}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
};
