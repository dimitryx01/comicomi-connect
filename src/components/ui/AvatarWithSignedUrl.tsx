import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from 'lucide-react';
import { useSignedUrl } from '@/hooks/useSignedUrl';
import { memo } from 'react';

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

// Usando memo para evitar re-renderizados innecesarios
const AvatarWithSignedUrlComponent = ({ 
  fileId, 
  fallbackText, 
  className = '', 
  size = 'md'
}: AvatarWithSignedUrlProps) => {
  const { signedUrl, loading, error } = useSignedUrl(fileId, {
    component: 'AvatarWithSignedUrl'
  });

  const hasValidImage = signedUrl && !error && !loading;

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {hasValidImage && (
        <AvatarImage 
          src={signedUrl} 
          alt={fallbackText || 'Avatar'} 
          onError={() => {/* Error silencioso */}}
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

// Función de comparación personalizada para memo
const arePropsEqual = (prevProps: AvatarWithSignedUrlProps, nextProps: AvatarWithSignedUrlProps) => {
  return (
    prevProps.fileId === nextProps.fileId &&
    prevProps.fallbackText === nextProps.fallbackText &&
    prevProps.size === nextProps.size &&
    prevProps.className === nextProps.className
  );
};

// Exportamos el componente memoizado
export const AvatarWithSignedUrl = memo(AvatarWithSignedUrlComponent, arePropsEqual);