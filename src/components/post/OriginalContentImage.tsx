
import { useState } from 'react';
import { useSignedUrl } from '@/hooks/useSignedUrl';

interface OriginalContentImageProps {
  fileId: string;
  alt: string;
  className?: string;
}

export const OriginalContentImage = ({ fileId, alt, className }: OriginalContentImageProps) => {
  const [hasError, setHasError] = useState(false);
  const shouldQuery = Boolean(fileId && fileId.trim() && fileId !== 'undefined');
  const { signedUrl, loading, error } = useSignedUrl(shouldQuery ? fileId : null);

  console.log('🖼️ OriginalContentImage: Renderizado:', {
    fileId: fileId ? fileId.substring(0, 50) + '...' : 'no fileId',
    shouldQuery,
    hasSignedUrl: !!signedUrl,
    loading,
    error: !!error,
    hasError
  });

  if (!shouldQuery || error || hasError) {
    console.log('❌ OriginalContentImage: No se puede mostrar imagen:', {
      shouldQuery,
      error: !!error,
      hasError
    });
    return (
      <div className={`${className} bg-gray-200 flex items-center justify-center`}>
        <span className="text-gray-500 text-sm">Sin imagen</span>
      </div>
    );
  }

  if (loading || !signedUrl) {
    console.log('⏳ OriginalContentImage: Cargando imagen...');
    return (
      <div className={`${className} bg-gray-100 animate-pulse flex items-center justify-center`}>
        <span className="text-gray-400 text-sm">Cargando...</span>
      </div>
    );
  }

  return (
    <img
      src={signedUrl}
      alt={alt}
      className={className}
      loading="lazy"
      onLoad={() => {
        console.log('✅ OriginalContentImage: Imagen cargada exitosamente:', 
          fileId ? fileId.substring(0, 30) + '...' : 'no fileId');
      }}
      onError={(e) => {
        console.error('🚨 OriginalContentImage: Error cargando imagen:', {
          fileId: fileId ? fileId.substring(0, 30) + '...' : 'no fileId',
          signedUrl: signedUrl?.substring(0, 100) + '...',
          error: e
        });
        setHasError(true);
      }}
    />
  );
};
