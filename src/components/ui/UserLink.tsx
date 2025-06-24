
import { Link, useNavigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UserLinkProps {
  username: string;
  children: ReactNode;
  className?: string;
}

export const UserLink = ({ username, children, className = "" }: UserLinkProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Limpiar el username removiendo @ si existe
  const cleanUsername = username.replace('@', '');
  
  // Verificar si es el usuario actual
  const isCurrentUser = user?.user_metadata?.username === cleanUsername;
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isCurrentUser) {
      // Si es el usuario actual, ir al perfil privado
      console.log('🔄 UserLink: Usuario actual detectado, navegando a perfil privado');
      navigate('/profile');
    } else {
      // Si es otro usuario, ir al perfil público (sin @)
      console.log('🔄 UserLink: Navegando a perfil público:', cleanUsername);
      navigate(`/${cleanUsername}`);
    }
  };
  
  return (
    <div 
      className={`cursor-pointer ${className}`}
      onClick={handleClick}
    >
      {children}
    </div>
  );
};
