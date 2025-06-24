
import { Link } from 'react-router-dom';
import { ReactNode } from 'react';

interface UserLinkProps {
  username: string;
  children: ReactNode;
  className?: string;
}

export const UserLink = ({ username, children, className = "" }: UserLinkProps) => {
  // Limpiar el username removiendo @ si existe
  const cleanUsername = username.replace('@', '');
  
  return (
    <Link 
      to={`/@${cleanUsername}`} 
      className={className}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </Link>
  );
};
