import { memo, useState, useEffect } from 'react';
import { publicImageCache } from '@/utils/PublicImageCache';
import { isPublicUrl } from '@/utils/publicUrlDetector';
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
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!fileIdOrUrl) {
      setIsLoading(false);
      return;
    }

    const loadImage = async () => {
      try {
        setIsLoading(true);
        setHasError(false);

        if (isPublicUrl(fileIdOrUrl)) {
          // Use PublicImageCache for public URLs
          const url = await publicImageCache.getRecipeImage(fileIdOrUrl);
          setImageUrl(url);
        } else {
          // Private fileId - shouldn't happen for recipes
          console.warn('🚨 RecipeImage: Private fileId for recipe:', fileIdOrUrl);
          setImageUrl(fileIdOrUrl);
        }
        
        setIsLoading(false);
        onLoad?.();
      } catch (error) {
        console.error('Error loading recipe image:', error);
        setHasError(true);
        setIsLoading(false);
        onError?.();
      }
    };

    loadImage();
  }, [fileIdOrUrl, onLoad, onError]);

  // Crear contenido de fallback específico para recetas
  const recipeFallbackContent = variant === 'cover' ? (
    <div className="flex items-center justify-center h-full bg-muted text-center text-muted-foreground">
      <div>
        <div className="text-6xl mb-3">👨‍🍳</div>
        <p className="text-lg font-medium">Receta</p>
        <p className="text-sm opacity-75">Imagen de receta</p>
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-full bg-muted text-center text-muted-foreground">
      <div>
        <ChefHat className="h-16 w-16 mx-auto mb-2" />
        <p className="text-sm">Receta</p>
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
        {recipeFallbackContent}
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

export const RecipeImage = memo(RecipeImageComponent);