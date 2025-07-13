import { useState, useEffect, memo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { useFollowSystem } from '@/hooks/useFollowSystem';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/utils/logConfig';

interface FollowButtonProps {
  type: 'user' | 'restaurant';
  targetId: string;
  isFollowing: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'secondary';
}

const FollowButtonComponent = ({ 
  type, 
  targetId, 
  isFollowing, 
  onFollowChange,
  size = 'default',
  variant = 'default'
}: FollowButtonProps) => {
  // Estado local sincronizado con prop inicial
  const [localFollowing, setLocalFollowing] = useState(isFollowing);
  const { followUser, unfollowUser, followRestaurant, unfollowRestaurant, loading } = useFollowSystem();
  const { user } = useAuth();
  const isProcessingRef = useRef(false);
  
  logger.log('FollowButton', `Rendering FollowButton for ${type} ${targetId}, isFollowing: ${isFollowing}, localFollowing: ${localFollowing}`);

  // Sincronizar estado local cuando cambia el prop isFollowing
  useEffect(() => {
    logger.log('FollowButton', `isFollowing prop changed to ${isFollowing}, updating local state`);
    if (isFollowing !== localFollowing) {
      setLocalFollowing(isFollowing);
    }
  }, [isFollowing]);

  const handleToggleFollow = async () => {
    if (!user || isProcessingRef.current) return;
    
    isProcessingRef.current = true;
    logger.log('FollowButton', `Toggle follow clicked for ${type} ${targetId}, current state: ${localFollowing}`);

    let success = false;
    const targetAction = !localFollowing;
    
    try {
      if (type === 'user') {
        if (localFollowing) {
          success = await unfollowUser(targetId);
        } else {
          success = await followUser(targetId);
        }
      } else {
        if (localFollowing) {
          success = await unfollowRestaurant(targetId);
        } else {
          success = await followRestaurant(targetId);
        }
      }

      if (success) {
        const newFollowingState = targetAction;
        logger.log('FollowButton', `Follow action successful, new state: ${newFollowingState}`);
        setLocalFollowing(newFollowingState);
        onFollowChange?.(newFollowingState);
      }
    } finally {
      isProcessingRef.current = false;
    }
  };

  if (!user) return null;

  return (
    <Button
      onClick={handleToggleFollow}
      disabled={loading}
      size={size}
      variant={localFollowing ? 'outline' : variant}
      className={localFollowing ? 'hover:bg-red-50 hover:text-red-600 hover:border-red-200' : ''}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : localFollowing ? (
        <>
          <UserMinus className="h-4 w-4 mr-2" />
          Siguiendo
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-2" />
          Seguir
        </>
      )}
    </Button>
  );
};

// Función de comparación personalizada para memo
const arePropsEqual = (prevProps: FollowButtonProps, nextProps: FollowButtonProps) => {
  const propsEqual = (
    prevProps.type === nextProps.type &&
    prevProps.targetId === nextProps.targetId &&
    prevProps.isFollowing === nextProps.isFollowing &&
    prevProps.size === nextProps.size &&
    prevProps.variant === nextProps.variant
  );
  
  if (!propsEqual) {
    logger.log('FollowButton', 'Props changed, re-rendering', {
      prev: { ...prevProps },
      next: { ...nextProps },
      changed: {
        type: prevProps.type !== nextProps.type,
        targetId: prevProps.targetId !== nextProps.targetId,
        isFollowing: prevProps.isFollowing !== nextProps.isFollowing,
        size: prevProps.size !== nextProps.size,
        variant: prevProps.variant !== nextProps.variant
      }
    });
  }
  
  return propsEqual;
};

// Exportamos el componente memoizado
export const FollowButton = memo(FollowButtonComponent, arePropsEqual);