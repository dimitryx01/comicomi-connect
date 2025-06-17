
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getSignedMediaUrl } from '@/utils/mediaStorage';
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
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fileId) {
      setSignedUrl(null);
      setError(null);
      return;
    }

    let isCancelled = false;

    const fetchSignedUrl = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('🖼️ AvatarWithSignedUrl: Obteniendo URL firmada para:', fileId);
        const url = await getSignedMediaUrl(fileId);
        if (!isCancelled) {
          setSignedUrl(url);
          console.log('✅ AvatarWithSignedUrl: URL firmada obtenida exitosamente');
        }
      } catch (err) {
        console.error('❌ AvatarWithSignedUrl: Error obteniendo URL firmada:', err);
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Error desconocido');
          setSignedUrl(null);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchSignedUrl();

    return () => {
      isCancelled = true;
    };
  }, [fileId]);

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {signedUrl && !error && (
        <AvatarImage 
          src={signedUrl} 
          alt={fallbackText || 'Avatar'} 
          onError={() => {
            console.warn('🚨 AvatarWithSignedUrl: Error cargando imagen, mostrando fallback');
            setError('Error cargando imagen');
          }}
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
