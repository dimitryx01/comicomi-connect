import { memo } from 'react';
import { PublicImage } from '@/components/ui/PublicImage';

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
  // Crear contenido de fallback específico para restaurantes
  const restaurantFallbackContent = variant === 'cover' ? (
    <div className="text-center text-muted-foreground">
      <div className="text-6xl mb-3">🏪</div>
      <p className="text-lg font-medium">Restaurante</p>
      <p className="text-sm opacity-75">Imagen de portada</p>
    </div>
  ) : (
    <div className="text-center text-muted-foreground">
      <div className="text-4xl mb-2">🍽️</div>
      <p className="text-sm">Restaurante</p>
    </div>
  );

  return (
    <PublicImage
      fileIdOrUrl={fileId}
      alt={alt}
      className={className}
      onError={onError}
      onLoad={onLoad}
      loading={loading}
      variant={variant}
      fallbackContent={restaurantFallbackContent}
    />
  );
};

export const RestaurantImage = memo(RestaurantImageComponent);