
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

// Función para determinar si es una URL pública o un fileId privado
const isPublicUrl = (url: string): boolean => {
  return url.startsWith('http://') || url.startsWith('https://');
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

  console.log('🖼️ AvatarWithSignedUrl: Iniciando componente con props:', {
    fileId,
    fallbackText,
    size,
    hasFileId: !!fileId,
    isPublicUrl: fileId ? isPublicUrl(fileId) : false
  });

  useEffect(() => {
    if (!fileId) {
      console.log('⚠️ AvatarWithSignedUrl: No fileId proporcionado, usando fallback');
      setImageUrl(null);
      setError(null);
      return;
    }

    // Si es una URL pública, usarla directamente
    if (isPublicUrl(fileId)) {
      console.log('🌐 AvatarWithSignedUrl: Es URL pública, usando directamente:', fileId);
      setImageUrl(fileId);
      setError(null);
      return;
    }

    let isCancelled = false;

    const loadImage = async () => {
      console.log('🔄 AvatarWithSignedUrl: Iniciando carga de imagen para fileId privado:', fileId);
      setLoading(true);
      setError(null);
      
      try {
        console.log('📡 AvatarWithSignedUrl: Solicitando URL firmada con cache para fileId privado:', fileId);
        
        // Usar cache inteligente para reducir descargas
        const cachedUrl = await imageCache.get(fileId, async () => {
          console.log('🆕 AvatarWithSignedUrl: Cache miss, obteniendo nueva URL firmada');
          return await getSignedMediaUrl(fileId);
        });

        if (!isCancelled) {
          console.log('✅ AvatarWithSignedUrl: URL obtenida exitosamente:', {
            fileId,
            urlLength: cachedUrl.length,
            urlPreview: cachedUrl.substring(0, 50) + '...'
          });
          setImageUrl(cachedUrl);
        }
      } catch (err) {
        console.error('❌ AvatarWithSignedUrl: Error cargando avatar:', {
          fileId,
          error: err,
          errorMessage: err instanceof Error ? err.message : 'Error desconocido'
        });
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Error desconocido');
          setImageUrl(null);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
          console.log('🏁 AvatarWithSignedUrl: Proceso completado para fileId:', fileId);
        }
      }
    };

    loadImage();

    return () => {
      isCancelled = true;
      console.log('🛑 AvatarWithSignedUrl: Cleanup para fileId:', fileId);
    };
  }, [fileId]);

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {imageUrl && !error && !loading && (
        <AvatarImage 
          src={imageUrl} 
          alt={fallbackText || 'Avatar'} 
          onError={() => {
            console.warn('🚨 AvatarWithSignedUrl: Error cargando imagen del DOM:', {
              fileId,
              imageUrl: imageUrl?.substring(0, 100) + '...'
            });
            setError('Error cargando imagen');
          }}
          onLoad={() => {
            console.log('🎉 AvatarWithSignedUrl: Imagen cargada exitosamente en el DOM:', fileId);
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
