
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from 'lucide-react';
import { useSignedUrl } from '@/hooks/useSignedUrl';
import { memo, useMemo } from 'react';

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

const AvatarWithSignedUrlComponent = ({ 
  fileId, 
  fallbackText, 
  className = '', 
  size = 'md'
}: AvatarWithSignedUrlProps) => {
  // Memoizar el fileId para evitar re-fetches innecesarios
  const memoizedFileId = useMemo(() => fileId, [fileId]);
  const { signedUrl, loading, error } = useSignedUrl(memoizedFileId);

  // Solo loggear en desarrollo y con throttling
  if (process.env.NODE_ENV === 'development') {
    console.log('🖼️ AvatarWithSignedUrl: Componente renderizado:', {
      fileId: memoizedFileId ? memoizedFileId.substring(0, 30) + '...' : 'no fileId',
      fallbackText,
      size,
      hasFileId: !!memoizedFileId,
      signedUrl: signedUrl ? signedUrl.substring(0, 50) + '...' : 'no url',
      loading,
      hasError: !!error
    });
  }

  // Memoizar si la imagen es válida
  const hasValidImage = useMemo(() => 
    signedUrl && !error && !loading, 
    [signedUrl, error, loading]
  );

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {hasValidImage && (
        <AvatarImage 
          src={signedUrl} 
          alt={fallbackText || 'Avatar'} 
          onError={(e) => {
            if (process.env.NODE_ENV === 'development') {
              console.warn('🚨 AvatarWithSignedUrl: Error DOM cargando imagen:', {
                fileId: memoizedFileId ? memoizedFileId.substring(0, 30) + '...' : 'no fileId',
                signedUrl: signedUrl?.substring(0, 100) + '...',
                error: e
              });
            }
          }}
          onLoad={() => {
            if (process.env.NODE_ENV === 'development') {
              console.log('🎉 AvatarWithSignedUrl: Imagen cargada exitosamente:', 
                memoizedFileId ? memoizedFileId.substring(0, 30) + '...' : 'no fileId');
            }
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

// Memoizar el componente para evitar re-renders innecesarios
export const AvatarWithSignedUrl = memo(AvatarWithSignedUrlComponent);
