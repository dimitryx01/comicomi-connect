
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from 'lucide-react';
import { useSignedUrlQuery } from '@/hooks/useSignedUrlQuery';

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
  // Solo hacer la query si hay un fileId válido
  const shouldQuery = Boolean(fileId && fileId.trim() && fileId !== 'undefined');
  const { data: imageUrl, isLoading, error } = useSignedUrlQuery(shouldQuery ? fileId : null);

  console.log('🖼️ AvatarWithSignedUrl: Componente renderizado:', {
    fileId,
    shouldQuery,
    fallbackText,
    size,
    hasFileId: !!fileId,
    fileIdType: typeof fileId,
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
              fileId,
              imageUrl: imageUrl?.substring(0, 100) + '...',
              error: e
            });
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
