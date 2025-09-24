import { memo, useEffect, useState } from 'react';
import { universalImageCache } from '@/utils/UniversalImageCache';
import { useSignedUrl } from '@/hooks/useSignedUrl';

interface OptimizedRestaurantImageProps {
  fileId?: string | null;
  alt: string;
  className?: string;
  onError?: () => void;
  onLoad?: () => void;
  loading?: 'lazy' | 'eager';
  variant?: 'main' | 'cover';
}

const OptimizedRestaurantImageComponent = ({ 
  fileId, 
  alt, 
  className = '',
  onError,
  onLoad,
  loading = 'lazy',
  variant = 'main'
}: OptimizedRestaurantImageProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Use signed URL hook for fallback
  const { signedUrl, loading: signingUrl } = useSignedUrl(fileId, {
    component: 'OptimizedRestaurantImage',
    expiresIn: 1800
  });

  useEffect(() => {
    if (!fileId) {
      setIsLoading(false);
      return;
    }

    const loadImage = async () => {
      try {
        setIsLoading(true);
        setHasError(false);

        // Check session storage first for quick navigation
        const sessionKey = `restaurant_image_${fileId}`;
        const sessionCached = sessionStorage.getItem(sessionKey);
        
        if (sessionCached) {
          setImageUrl(sessionCached);
          setIsLoading(false);
          onLoad?.();
          return;
        }

        // Try universal cache
        const cachedUrl = await universalImageCache.getImage(fileId, async () => {
          if (!signedUrl) {
            throw new Error('No signed URL available');
          }
          return signedUrl;
        });

        if (cachedUrl) {
          setImageUrl(cachedUrl);
          // Store in session for instant navigation
          sessionStorage.setItem(sessionKey, cachedUrl);
          setIsLoading(false);
          onLoad?.();
        }
      } catch (error) {
        console.error('Error loading restaurant image:', error);
        setHasError(true);
        setIsLoading(false);
        onError?.();
      }
    };

    if (!signingUrl && (signedUrl || fileId)) {
      loadImage();
    }
  }, [fileId, signedUrl, signingUrl, onLoad, onError]);

  // Fallback content for restaurants
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

export const OptimizedRestaurantImage = memo(OptimizedRestaurantImageComponent);