
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useUnifiedSignedUrl } from '@/hooks/useUnifiedSignedUrl';

interface FallbackImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: 'high' | 'medium' | 'low';
}

/**
 * Componente de imagen fallback sin lazy loading ni optimizaciones
 * Para diagnóstico y casos donde SmartLazyImage falla
 */
export const FallbackImage = ({
  src,
  alt,
  className,
  priority = 'medium'
}: FallbackImageProps) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Obtener URL firmada
  const { data: signedUrl, isLoading: urlLoading, error: urlError } = useUnifiedSignedUrl(
    src,
    {
      enabled: true,
      type: 'media',
      priority
    }
  );

  const finalUrl = signedUrl || src;

  console.log('🆘 DIAGNOSTIC - FallbackImage:', {
    src: src.substring(0, 50) + '...',
    hasSignedUrl: !!signedUrl,
    urlLoading,
    urlError: !!urlError,
    finalUrl: finalUrl?.substring(0, 100) + '...'
  });

  if (urlError) {
    console.error('❌ DIAGNOSTIC - FallbackImage URL error:', urlError);
    return (
      <div className={cn("flex items-center justify-center bg-red-50 border border-red-200", className)}>
        <span className="text-red-600 text-sm">Error obteniendo URL</span>
      </div>
    );
  }

  if (urlLoading) {
    return (
      <div className={cn("flex items-center justify-center bg-gray-100", className)}>
        <span className="text-gray-600 text-sm">Obteniendo URL...</span>
      </div>
    );
  }

  if (!finalUrl) {
    return (
      <div className={cn("flex items-center justify-center bg-gray-100", className)}>
        <span className="text-gray-600 text-sm">Sin URL</span>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={cn("flex items-center justify-center bg-red-50 border border-red-200", className)}>
        <div className="text-center p-2">
          <span className="text-red-600 text-sm block mb-2">Error cargando imagen</span>
          <button 
            onClick={() => {
              setHasError(false);
              setIsLoaded(false);
            }}
            className="text-blue-500 text-xs hover:underline"
          >
            Reintentar
          </button>
          {import.meta.env.DEV && (
            <div className="mt-2 text-xs text-gray-500">
              URL: {finalUrl.substring(0, 100)}...
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <span className="text-gray-500 text-sm">Cargando...</span>
        </div>
      )}
      <img
        src={finalUrl}
        alt={alt}
        className={cn(
          "w-full h-full object-cover",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        onLoad={() => {
          console.log('✅ DIAGNOSTIC - FallbackImage cargada exitosamente:', finalUrl.substring(0, 100) + '...');
          setIsLoaded(true);
          setHasError(false);
        }}
        onError={(e) => {
          console.error('❌ DIAGNOSTIC - FallbackImage error:', {
            url: finalUrl.substring(0, 100) + '...',
            error: e
          });
          setHasError(true);
        }}
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
