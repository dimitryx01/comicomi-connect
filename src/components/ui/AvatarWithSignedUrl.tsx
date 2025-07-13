
import { memo, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from 'lucide-react';
import { useSignedUrl } from '@/hooks/useSignedUrl';

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

export const AvatarWithSignedUrl = memo(({ 
  fileId, 
  fallbackText, 
  className = '', 
  size = 'md'
}: AvatarWithSignedUrlProps) => {
  const { signedUrl, loading, error } = useSignedUrl(fileId);

  const hasValidImage = useMemo(() => {
    return signedUrl && !error && !loading;
  }, [signedUrl, error, loading]);

  const fallbackContent = useMemo(() => {
    if (fallbackText) {
      return (
        <span className="text-sm font-medium">
          {fallbackText.split(' ').map(n => n[0]).join('').toUpperCase()}
        </span>
      );
    }
    
    const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : size === 'lg' ? 'h-8 w-8' : 'h-12 w-12';
    return <User className={iconSize} />;
  }, [fallbackText, size]);

  const handleImageError = useMemo(() => (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.warn('🚨 AvatarWithSignedUrl: Error DOM cargando imagen:', {
      fileId: fileId ? fileId.substring(0, 30) + '...' : 'no fileId',
      signedUrl: signedUrl?.substring(0, 100) + '...',
      error: e
    });
  }, [fileId, signedUrl]);

  const handleImageLoad = useMemo(() => () => {
    console.log('🎉 AvatarWithSignedUrl: Imagen cargada exitosamente:', 
      fileId ? fileId.substring(0, 30) + '...' : 'no fileId');
  }, [fileId]);

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {hasValidImage && (
        <AvatarImage 
          src={signedUrl} 
          alt={fallbackText || 'Avatar'} 
          onError={handleImageError}
          onLoad={handleImageLoad}
          loading="lazy"
        />
      )}
      <AvatarFallback>
        {fallbackContent}
      </AvatarFallback>
    </Avatar>
  );
});

AvatarWithSignedUrl.displayName = 'AvatarWithSignedUrl';
