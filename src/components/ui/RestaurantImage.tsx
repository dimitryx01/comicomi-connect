import { memo, useState, useEffect } from 'react';
import { publicImageCache } from '@/utils/PublicImageCache';
import { isPublicUrl } from '@/utils/publicUrlDetector';

interface RestaurantImageProps {
  fileId?: string | null;
  alt: string;
  className?: string;
  onError?: () => void;
  onLoad?: () => void;
  loading?: 'lazy' | 'eager';
  variant?: 'main' | 'cover';
}

const RestaurantImageComponent = ({ 
  fileId, 
  alt, 
  className = '',
  onError,
  onLoad,
  loading = 'lazy',
  variant = 'main'
}: RestaurantImageProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!fileId) {
      setIsLoading(false);
      return;
    }

    const loadImage = async () => {
      try {
        setIsLoading(true);
        setHasError(false);

        if (isPublicUrl(fileId)) {
          // Use PublicImageCache for public URLs
          const url = await publicImageCache.getRestaurantImage(fileId);
          setImageUrl(url);
        } else {
          // Private fileId - shouldn't happen for restaurants
          console.warn('🚨 RestaurantImage: Private fileId for restaurant:', fileId);
          setImageUrl(fileId);
        }
        
        setIsLoading(false);
        onLoad?.();
      } catch (error) {
        console.error('Error loading restaurant image:', error);
        setHasError(true);
        setIsLoading(false);
        onError?.();
      }
    };

    loadImage();
  }, [fileId, onLoad, onError]);

  // Crear contenido de fallback específico para restaurantes
  const restaurantFallbackContent = variant === 'cover' ? (
    <div className="flex items-center justify-center h-full bg-muted text-center text-muted-foreground">
      <div>
        <div className="text-6xl mb-3">🏪</div>
        <p className="text-lg font-medium">Restaurante</p>
        <p className="text-sm opacity-75">Imagen de portada</p>
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-full bg-muted text-center text-muted-foreground">
      <div>
        <div className="text-4xl mb-2">🍽️</div>
        <p className="text-sm">Restaurante</p>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-muted animate-pulse ${className}`}>
        <div className="text-muted-foreground">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (hasError || !imageUrl) {
    return (
      <div className={className}>
        {restaurantFallbackContent}
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      loading={loading}
      onError={() => {
        setHasError(true);
        onError?.();
      }}
      onLoad={() => onLoad?.()}
    />
  );
};

export const RestaurantImage = memo(RestaurantImageComponent);