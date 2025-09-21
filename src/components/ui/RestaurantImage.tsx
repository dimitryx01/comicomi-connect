import { useSignedUrl } from '@/hooks/useSignedUrl';
import { memo } from 'react';

interface RestaurantImageProps {
  fileId?: string | null;
  alt: string;
  className?: string;
  onError?: () => void;
  onLoad?: () => void;
  loading?: 'lazy' | 'eager';
}

const RestaurantImageComponent = ({ 
  fileId, 
  alt, 
  className = '',
  onError,
  onLoad,
  loading = 'lazy'
}: RestaurantImageProps) => {
  const { signedUrl, loading: urlLoading, error } = useSignedUrl(fileId, {
    component: 'RestaurantImage',
    expiresIn: 1800 // 30 minutos para imágenes de restaurantes
  });

  if (error || (!urlLoading && !signedUrl && fileId)) {
    return (
      <div className={`${className} bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center`}>
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-2">🍽️</div>
          <p className="text-sm">Restaurante</p>
        </div>
      </div>
    );
  }

  if (urlLoading || !signedUrl) {
    return (
      <div className={`${className} bg-gradient-to-br from-orange-100 to-red-200 animate-pulse flex items-center justify-center`}>
        <div className="text-center text-gray-400">
          <div className="text-2xl mb-1">⏳</div>
          <p className="text-xs">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={signedUrl}
      alt={alt}
      className={className}
      loading={loading}
      onLoad={onLoad}
      onError={onError}
    />
  );
};

export const RestaurantImage = memo(RestaurantImageComponent);