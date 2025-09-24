import { memo } from 'react';
import { PublicImage } from '@/components/ui/PublicImage';
import { ChefHat } from 'lucide-react';

interface RecipeImageProps {
  fileIdOrUrl?: string | null;
  alt: string;
  className?: string;
  onError?: () => void;
  onLoad?: () => void;
  loading?: 'lazy' | 'eager';
  variant?: 'main' | 'cover';
}

const RecipeImageComponent = ({ 
  fileIdOrUrl, 
  alt, 
  className = '',
  onError,
  onLoad,
  loading = 'lazy',
  variant = 'main'
}: RecipeImageProps) => {
  // Crear contenido de fallback específico para recetas
  const recipeFallbackContent = variant === 'cover' ? (
    <div className="text-center text-muted-foreground">
      <div className="text-6xl mb-3">👨‍🍳</div>
      <p className="text-lg font-medium">Receta</p>
      <p className="text-sm opacity-75">Imagen de receta</p>
    </div>
  ) : (
    <div className="text-center text-muted-foreground">
      <ChefHat className="h-16 w-16 mx-auto mb-2" />
      <p className="text-sm">Receta</p>
    </div>
  );

  return (
    <PublicImage
      fileIdOrUrl={fileIdOrUrl}
      alt={alt}
      className={className}
      onError={onError}
      onLoad={onLoad}
      loading={loading}
      variant={variant}
      fallbackContent={recipeFallbackContent}
    />
  );
};

export const RecipeImage = memo(RecipeImageComponent);