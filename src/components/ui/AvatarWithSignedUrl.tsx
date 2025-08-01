
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
  const { signedUrl, loading, error } = useSignedUrl(fileId, {
    component: 'AvatarWithSignedUrl',
    expiresIn: 1800 // 30 minutos para avatares
  });

  const hasValidImage = useMemo(() => signedUrl && !error && !loading, [signedUrl, error, loading]);

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {hasValidImage && (
        <AvatarImage 
          src={signedUrl} 
          alt={fallbackText || 'Avatar'} 
          onError={() => {}}
          onLoad={() => {}}
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
