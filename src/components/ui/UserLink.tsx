
import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface UserLinkProps {
  username: string;
  children: ReactNode;
  className?: string;
}

export const UserLink = ({ username, children, className }: UserLinkProps) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🔗 UserLink clicked:', { username });
    
    // Verificar que el username sea válido antes de navegar
    if (!username || username.trim() === '') {
      console.warn('⚠️ Username is empty, not navigating');
      return;
    }
    
    // Navegar al perfil del usuario
    navigate(`/profile/${username}`);
  };

  // Si no hay username, no renderizar como link
  if (!username || username.trim() === '') {
    return <div className={className}>{children}</div>;
  }

  return (
    <div 
      className={cn("cursor-pointer", className)} 
      onClick={handleClick}
    >
      {children}
    </div>
  );
};
