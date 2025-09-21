import { useSignedUrl } from '@/hooks/useSignedUrl';
import { memo } from 'react';

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
  const { signedUrl, loading: urlLoading, error } = useSignedUrl(fileId, {
    component: 'RestaurantImage',
    expiresIn: 1800 // 30 minutos para imágenes de restaurantes
  });

  // Si no hay fileId, mostrar imagen predeterminada inmediatamente
  if (!fileId) {
    const defaultContent = variant === 'cover' ? (
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
      <div className={`${className} bg-gradient-to-br from-muted/50 to-accent/30 flex items-center justify-center`}>
        {defaultContent}
      </div>
    );
  }

  // Si hay error al cargar la imagen
  if (error || (!urlLoading && !signedUrl)) {
    const errorContent = variant === 'cover' ? (
      <div className="text-center text-muted-foreground">
        <div className="text-6xl mb-3">❌</div>
        <p className="text-lg font-medium">Error al cargar</p>
        <p className="text-sm opacity-75">Imagen no disponible</p>
      </div>
    ) : (
      <div className="text-center text-muted-foreground">
        <div className="text-4xl mb-2">❌</div>
        <p className="text-sm">Error al cargar</p>
      </div>
    );

    return (
      <div className={`${className} bg-gradient-to-br from-destructive/10 to-destructive/20 flex items-center justify-center`}>
        {errorContent}
      </div>
    );
  }

  // Si está cargando
  if (urlLoading) {
    const loadingContent = variant === 'cover' ? (
      <div className="text-center text-muted-foreground">
        <div className="text-5xl mb-3">⏳</div>
        <p className="text-lg font-medium">Cargando...</p>
        <p className="text-sm opacity-75">Preparando imagen</p>
      </div>
    ) : (
      <div className="text-center text-muted-foreground">
        <div className="text-2xl mb-1">⏳</div>
        <p className="text-xs">Cargando...</p>
      </div>
    );

    return (
      <div className={`${className} bg-gradient-to-br from-primary/10 to-primary/20 animate-pulse flex items-center justify-center`}>
        {loadingContent}
      </div>
    );
  }

  // Mostrar imagen real
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