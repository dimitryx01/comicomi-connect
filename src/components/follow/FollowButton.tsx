
import { useState, useEffect, memo } from 'react';
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

export const FollowButton = memo(({ 
  type, 
  targetId, 
  isFollowing, 
  onFollowChange,
  size = 'default',
  variant = 'default'
}: FollowButtonProps) => {
  const [localFollowing, setLocalFollowing] = useState(isFollowing);
  const { followUser, unfollowUser, followRestaurant, unfollowRestaurant, loading } = useFollowSystem();
  const { user } = useAuth();

  // Sync local state when prop changes
  useEffect(() => {
    if (isFollowing !== localFollowing) {
      setLocalFollowing(isFollowing);
    }
  }, [isFollowing]);

  const handleToggleFollow = async () => {
    if (!user) return;

    let success = false;
    const targetAction = !localFollowing;
    
    if (type === 'user') {
      success = localFollowing 
        ? await unfollowUser(targetId)
        : await followUser(targetId);
    } else {
      success = localFollowing
        ? await unfollowRestaurant(targetId)
        : await followRestaurant(targetId);
    }

    if (success) {
      setLocalFollowing(targetAction);
      onFollowChange?.(targetAction);
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
});

FollowButton.displayName = 'FollowButton';
