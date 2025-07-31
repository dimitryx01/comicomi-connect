import { Button } from '@/components/ui/button';
import { AvatarWithSignedUrl } from '@/components/ui/AvatarWithSignedUrl';
import { FollowButton } from '@/components/follow/FollowButton';
import { UserLink } from '@/components/ui/UserLink';
import { useAuth } from '@/contexts/AuthContext';
import { useUserFollowStats } from '@/hooks/useFollowStats';

interface PublicUserCardProps {
  user: {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string;
  };
}

export const PublicUserCard = ({ user }: PublicUserCardProps) => {
  const { user: currentUser } = useAuth();
  const { isFollowing } = useUserFollowStats(user.id);

  // No mostrar al usuario actual en la lista
  if (currentUser?.id === user.id) {
    return null;
  }

  return (
    <div className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors group">
      <UserLink username={user.username} className="flex items-center space-x-4 flex-1 min-w-0">
        <AvatarWithSignedUrl
          fileId={user.avatar_url}
          fallbackText={user.full_name || user.username}
          size="sm"
          className="flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">
            {user.full_name || user.username}
          </p>
          <p className="text-sm text-muted-foreground truncate">
            @{user.username}
          </p>
        </div>
      </UserLink>
      
      {currentUser && (
        <div className="flex-shrink-0">
          <FollowButton
            type="user"
            targetId={user.id}
            isFollowing={isFollowing}
            size="sm"
            variant="default"
          />
        </div>
      )}
    </div>
  );
};