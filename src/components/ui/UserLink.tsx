
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface UserLinkProps {
  username: string;
  displayName?: string;
  className?: string;
  showAt?: boolean;
  children?: React.ReactNode;
}

export const UserLink = ({ 
  username, 
  displayName, 
  className,
  showAt = false,
  children 
}: UserLinkProps) => {
  // Limpiar @ del username si viene incluido
  const cleanUsername = username?.replace('@', '') || '';
  
  if (!cleanUsername) {
    return <span className={className}>{displayName || children}</span>;
  }

  const displayText = children || displayName || `${showAt ? '@' : ''}${cleanUsername}`;

  return (
    <Link
      to={`/@${cleanUsername}`}
      className={cn(
        "hover:underline transition-colors text-primary hover:text-primary/80",
        className
      )}
      onClick={(e) => e.stopPropagation()} // Evitar que se propague a clics en cards
    >
      {displayText}
    </Link>
  );
};
