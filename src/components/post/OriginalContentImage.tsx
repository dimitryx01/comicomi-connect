
import { useUniversalImage } from '@/hooks/useUniversalImage';

interface OriginalContentImageProps {
  fileId: string;
  alt: string;
  className?: string;
  fetchFunction?: () => Promise<string>;
}

export const OriginalContentImage = ({ 
  fileId, 
  alt, 
  className,
  fetchFunction 
}: OriginalContentImageProps) => {
  // Si no se proporciona fetchFunction, usar una función dummy
  const defaultFetchFunction = async () => {
    throw new Error('No fetch function provided for OriginalContentImage');
  };

  const { imageUrl, loading, error } = useUniversalImage(
    fileId,
    fetchFunction || defaultFetchFunction
  );

  console.log('🖼️ OriginalContentImage: Renderizado con cache universal:', {
    fileId: fileId ? fileId.substring(0, 50) + '...' : 'no fileId',
    hasImageUrl: !!imageUrl,
    loading,
    hasError: !!error
  });

  if (error) {
    console.log('❌ OriginalContentImage: Error mostrando imagen:', {
      fileId: fileId ? fileId.substring(0, 30) + '...' : 'no fileId',
      error: error.message
    });
    return (
      <div className={`${className} bg-gray-200 flex items-center justify-center`}>
        <span className="text-gray-500 text-sm">Error cargando imagen</span>
      </div>
    );
  }

  if (loading || !imageUrl) {
    console.log('⏳ OriginalContentImage: Cargando imagen...');
    return (
      <div className={`${className} bg-gray-100 animate-pulse flex items-center justify-center`}>
        <span className="text-gray-400 text-sm">Cargando...</span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      loading="lazy"
      onLoad={() => {
        console.log('✅ OriginalContentImage: Imagen renderizada exitosamente:', 
          fileId ? fileId.substring(0, 30) + '...' : 'no fileId');
      }}
      onError={(e) => {
        console.error('🚨 OriginalContentImage: Error DOM cargando imagen:', {
          fileId: fileId ? fileId.substring(0, 30) + '...' : 'no fileId',
          imageUrl: imageUrl?.substring(0, 100) + '...',
          error: e
        });
      }}
    />
  );
};
