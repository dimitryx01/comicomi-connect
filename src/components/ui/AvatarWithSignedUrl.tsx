
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getSignedMediaUrl } from '@/utils/mediaStorage';
import { imageCache } from '@/utils/imageCache';
import { User } from 'lucide-react';

interface AvatarWithSignedUrlProps {
  fileId?: string | null;
  fallbackText?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-16 w-16',
  xl: 'h-24 w-24'
};

export const AvatarWithSignedUrl = ({ 
  fileId, 
  fallbackText, 
  className = '', 
  size = 'md' 
}: AvatarWithSignedUrlProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fileId) {
      setImageUrl(null);
      setError(null);
      return;
    }

    let isCancelled = false;

    const loadImage = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('🖼️ AvatarWithSignedUrl: Cargando avatar con cache:', fileId);
        
        // Usar cache inteligente para reducir descargas
        const cachedUrl = await imageCache.get(fileId, async () => {
          return await getSignedMediaUrl(fileId);
        });

        if (!isCancelled) {
          setImageUrl(cachedUrl);
          console.log('✅ AvatarWithSignedUrl: Avatar cargado exitosamente');
        }
      } catch (err) {
        console.error('❌ AvatarWithSignedUrl: Error cargando avatar:', err);
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Error desconocido');
          setImageUrl(null);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadImage();

    return () => {
      isCancelled = true;
    };
  }, [fileId]);

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {imageUrl && !error && (
        <AvatarImage 
          src={imageUrl} 
          alt={fallbackText || 'Avatar'} 
          onError={() => {
            console.warn('🚨 AvatarWithSignedUrl: Error cargando imagen, mostrando fallback');
            setError('Error cargando imagen');
          }}
          loading="lazy"
        />
      )}
      <AvatarFallback>
        {fallbackText ? (
          <span className="text-sm font-medium">
            {fallbackText.split(' ').map(n => n[0]).join('').toUpperCase()}
          </span>
        ) : (
          <User className={size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : size === 'lg' ? 'h-8 w-8' : 'h-12 w-12'} />
        )}
      </AvatarFallback>
    </Avatar>
  );
};
