
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from 'lucide-react';
import { useUnifiedSignedUrl } from '@/hooks/useUnifiedSignedUrl';

interface AvatarWithSignedUrlProps {
  fileId?: string | null;
  fallbackText?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  priority?: 'high' | 'medium' | 'low';
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
  size = 'md',
  priority = 'high' // Avatares tienen alta prioridad por defecto
}: AvatarWithSignedUrlProps) => {
  // Solo hacer la query si hay un fileId válido
  const shouldQuery = Boolean(fileId && fileId.trim() && fileId !== 'undefined');
  const { data: imageUrl, isLoading, error } = useUnifiedSignedUrl(
    shouldQuery ? fileId : null,
    {
      enabled: shouldQuery,
      type: 'avatar',
      priority
    }
  );

  console.log('🖼️ AvatarWithSignedUrl: Componente renderizado con cache unificado v2:', {
    fileId: fileId ? fileId.substring(0, 30) + '...' : 'no fileId',
    shouldQuery,
    fallbackText,
    size,
    priority,
    hasFileId: !!fileId,
    imageUrl: imageUrl ? imageUrl.substring(0, 50) + '...' : 'no url',
    isLoading,
    error: !!error
  });

  const hasValidImage = imageUrl && !error && !isLoading && shouldQuery;

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {hasValidImage && (
        <AvatarImage 
          src={imageUrl} 
          alt={fallbackText || 'Avatar'} 
          onError={(e) => {
            console.warn('🚨 AvatarWithSignedUrl: Error cargando imagen del DOM:', {
              fileId: fileId ? fileId.substring(0, 30) + '...' : 'no fileId',
              imageUrl: imageUrl?.substring(0, 100) + '...',
              error: e
            });
          }}
          onLoad={() => {
            console.log('🎉 AvatarWithSignedUrl: Imagen cargada exitosamente desde cache unificado v2:', 
              fileId ? fileId.substring(0, 30) + '...' : 'no fileId');
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
