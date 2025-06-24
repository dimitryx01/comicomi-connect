
import { useSignedUrl } from '@/hooks/useSignedUrl';

interface OriginalContentImageProps {
  fileId: string;
  alt: string;
  className?: string;
}

export const OriginalContentImage = ({ 
  fileId, 
  alt, 
  className 
}: OriginalContentImageProps) => {
  const { signedUrl, loading, error } = useSignedUrl(fileId);

  console.log('🖼️ OriginalContentImage: Renderizado:', {
    fileId: fileId ? fileId.substring(0, 50) + '...' : 'no fileId',
    hasSignedUrl: !!signedUrl,
    loading,
    hasError: !!error
  });

  if (error) {
    console.log('❌ OriginalContentImage: Error mostrando imagen:', {
      fileId: fileId ? fileId.substring(0, 30) + '...' : 'no fileId',
      error: error
    });
    return (
      <div className={`${className} bg-gray-200 flex items-center justify-center`}>
        <span className="text-gray-500 text-sm">Error cargando imagen</span>
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
        console.log('✅ OriginalContentImage: Imagen renderizada exitosamente:', 
          fileId ? fileId.substring(0, 30) + '...' : 'no fileId');
      }}
      onError={(e) => {
        console.error('🚨 OriginalContentImage: Error DOM cargando imagen:', {
          fileId: fileId ? fileId.substring(0, 30) + '...' : 'no fileId',
          signedUrl: signedUrl?.substring(0, 100) + '...',
          error: e
        });
      }}
    />
  );
};
