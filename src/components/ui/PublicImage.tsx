import { memo } from 'react';
import { useSignedUrl } from '@/hooks/useSignedUrl';
import { isPublicUrl } from '@/utils/publicUrlDetector';

interface PublicImageProps {
  fileIdOrUrl?: string | null;
  alt: string;
  className?: string;
  onError?: () => void;
  onLoad?: () => void;
  loading?: 'lazy' | 'eager';
  variant?: 'main' | 'cover';
  fallbackContent?: React.ReactNode;
}

const PublicImageComponent = ({ 
  fileIdOrUrl, 
  alt, 
  className = '',
  onError,
  onLoad,
  loading = 'lazy',
  variant = 'main',
  fallbackContent
}: PublicImageProps) => {
  // Detectar si es URL pública o fileId privado
  const isPublic = isPublicUrl(fileIdOrUrl);
  
  // Solo usar useSignedUrl para fileIds privados
  const { signedUrl, loading: urlLoading, error } = useSignedUrl(
    isPublic ? null : fileIdOrUrl, // Solo procesar si no es URL pública
    {
      component: 'PublicImage',
      expiresIn: 1800, // 30 minutos para fileIds privados
      enabled: !isPublic && !!fileIdOrUrl // Solo habilitar si no es público y hay fileId
    }
  );

  // Si no hay fileId ni URL, mostrar contenido de fallback
  if (!fileIdOrUrl) {
    if (fallbackContent) {
      return (
        <div className={`${className} bg-gradient-to-br from-muted/50 to-accent/30 flex items-center justify-center`}>
          {fallbackContent}
        </div>
      );
    }
    
    const defaultContent = variant === 'cover' ? (
      <div className="text-center text-muted-foreground">
        <div className="text-6xl mb-3">🖼️</div>
        <p className="text-lg font-medium">Sin imagen</p>
        <p className="text-sm opacity-75">Imagen no disponible</p>
      </div>
    ) : (
      <div className="text-center text-muted-foreground">
        <div className="text-4xl mb-2">🖼️</div>
        <p className="text-sm">Sin imagen</p>
      </div>
    );

    return (
      <div className={`${className} bg-gradient-to-br from-muted/50 to-accent/30 flex items-center justify-center`}>
        {defaultContent}
      </div>
    );
  }

  // Si es URL pública, usarla directamente
  if (isPublic) {
    return (
      <img
        src={fileIdOrUrl}
        alt={alt}
        className={className}
        loading={loading}
        onLoad={onLoad}
        onError={onError}
      />
    );
  }

  // Si hay error al cargar fileId privado
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

  // Si está cargando fileId privado
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

  // Mostrar imagen firmada (fileId privado)
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

export const PublicImage = memo(PublicImageComponent);