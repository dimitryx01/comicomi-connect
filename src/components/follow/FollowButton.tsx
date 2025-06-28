
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { useFollowSystem } from '@/hooks/useFollowSystem';
import { useAuth } from '@/contexts/AuthContext';

interface FollowButtonProps {
  type: 'user' | 'restaurant';
  targetId: string;
  isFollowing: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'secondary';
}

export const FollowButton = ({ 
  type, 
  targetId, 
  isFollowing, 
  onFollowChange,
  size = 'default',
  variant = 'default'
}: FollowButtonProps) => {
  // CORREGIR: Sincronizar estado local con prop inicial
  const [localFollowing, setLocalFollowing] = useState(isFollowing);
  const { followUser, unfollowUser, followRestaurant, unfollowRestaurant, loading } = useFollowSystem();
  const { user } = useAuth();

  // Sincronizar estado local cuando cambia el prop isFollowing
  useEffect(() => {
    console.log('🔄 FollowButton: Sincronizando estado:', {
      type,
      targetId,
      isFollowing,
      localFollowing,
      shouldUpdate: isFollowing !== localFollowing
    });
    
    if (isFollowing !== localFollowing) {
      setLocalFollowing(isFollowing);
    }
  }, [isFollowing, localFollowing, type, targetId]);

  const handleToggleFollow = async () => {
    if (!user) return;

    console.log('🎯 FollowButton: Iniciando toggle follow:', {
      type,
      targetId,
      currentState: localFollowing,
      willFollow: !localFollowing
    });

    let success = false;
    const targetAction = !localFollowing;
    
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

    console.log('🔄 FollowButton: Resultado de acción:', {
      success,
      targetAction,
      type,
      targetId
    });

    if (success) {
      const newFollowingState = targetAction;
      setLocalFollowing(newFollowingState);
      onFollowChange?.(newFollowingState);
      
      console.log('✅ FollowButton: Estado actualizado:', {
        newState: newFollowingState,
        type,
        targetId
      });
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
