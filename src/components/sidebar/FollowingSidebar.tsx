
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AvatarWithSignedUrl } from '@/components/ui/AvatarWithSignedUrl';
import { useFollowing } from '@/hooks/useFollowing';
import { useFollowSystem } from '@/hooks/useFollowSystem';
import { useUserFollowStats } from '@/hooks/useFollowStats';
import { useRestaurantFollowStats } from '@/hooks/useFollowStats';
import { Users, MapPin, UserMinus, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export const FollowingSidebar = () => {
  const { followedUsers, followedRestaurants, loading, error, refetch } = useFollowing();
  const { unfollowUser, unfollowRestaurant, loading: unfollowLoading } = useFollowSystem();
  const navigate = useNavigate();
  const [showUsers, setShowUsers] = useState(false);
  const [showRestaurants, setShowRestaurants] = useState(false);

  const handleUnfollowUser = async (userId: string) => {
    const success = await unfollowUser(userId);
    if (success) {
      refetch();
    }
  };

  const handleUnfollowRestaurant = async (restaurantId: string) => {
    const success = await unfollowRestaurant(restaurantId);
    if (success) {
      refetch();
    }
  };

  if (loading) {
    return (
      <div className="px-2 py-1">
        <div className="text-sm font-medium text-sidebar-foreground/70 mb-2">Siguiendo</div>
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center space-x-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-3 w-16 flex-1" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-2 py-1">
        <div className="text-sm font-medium text-sidebar-foreground/70 mb-2">Siguiendo</div>
        <div className="text-center py-2">
          <AlertCircle className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
          <p className="text-xs text-muted-foreground">Error al cargar</p>
        </div>
      </div>
    );
  }

  const hasFollowing = followedUsers.length > 0 || followedRestaurants.length > 0;

  if (!hasFollowing) {
    return (
      <div className="px-2 py-1">
        <div className="text-sm font-medium text-sidebar-foreground/70 mb-2">Siguiendo</div>
        <div className="text-center py-2">
          <p className="text-xs text-muted-foreground">
            No sigues a nadie aún
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-2 py-1 space-y-2">
      <div className="text-sm font-medium text-sidebar-foreground/70">Siguiendo</div>
      
      {followedUsers.length > 0 && (
        <div>
          <button
            onClick={() => setShowUsers(!showUsers)}
            className="flex items-center text-xs font-medium text-muted-foreground hover:text-foreground w-full mb-1"
          >
            {showUsers ? <ChevronDown className="h-3 w-3 mr-1" /> : <ChevronRight className="h-3 w-3 mr-1" />}
            <Users className="h-3 w-3 mr-1" />
            Personas ({followedUsers.length})
          </button>
          {showUsers && (
            <div className="space-y-1 ml-4">
              {followedUsers.slice(0, 3).map((user) => (
                <FollowedUserItem
                  key={user.id}
                  user={user}
                  onUnfollow={handleUnfollowUser}
                  unfollowLoading={unfollowLoading}
                  onNavigate={() => navigate(`/profile/${user.username}`)}
                />
              ))}
              {followedUsers.length > 3 && (
                <div className="text-xs text-muted-foreground pl-2">
                  +{followedUsers.length - 3} más
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {followedRestaurants.length > 0 && (
        <div>
          <button
            onClick={() => setShowRestaurants(!showRestaurants)}
            className="flex items-center text-xs font-medium text-muted-foreground hover:text-foreground w-full mb-1"
          >
            {showRestaurants ? <ChevronDown className="h-3 w-3 mr-1" /> : <ChevronRight className="h-3 w-3 mr-1" />}
            <MapPin className="h-3 w-3 mr-1" />
            Restaurantes ({followedRestaurants.length})
          </button>
          {showRestaurants && (
            <div className="space-y-1 ml-4">
              {followedRestaurants.slice(0, 3).map((restaurant) => (
                <FollowedRestaurantItem
                  key={restaurant.id}
                  restaurant={restaurant}
                  onUnfollow={handleUnfollowRestaurant}
                  unfollowLoading={unfollowLoading}
                  onNavigate={() => navigate(`/restaurants/${restaurant.id}`)}
                />
              ))}
              {followedRestaurants.length > 3 && (
                <div className="text-xs text-muted-foreground pl-2">
                  +{followedRestaurants.length - 3} más
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface FollowedUserItemProps {
  user: {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string;
  };
  onUnfollow: (userId: string) => void;
  unfollowLoading: boolean;
  onNavigate: () => void;
}

const FollowedUserItem = ({ user, onUnfollow, unfollowLoading, onNavigate }: FollowedUserItemProps) => {
  const { updateFollowState } = useUserFollowStats(user.id);

  const handleUnfollow = () => {
    updateFollowState(false);
    onUnfollow(user.id);
  };

  return (
    <div className="flex items-center space-x-2 p-1 rounded hover:bg-muted/50 transition-colors group">
      <button onClick={onNavigate} className="flex items-center space-x-2 flex-1 min-w-0">
        <AvatarWithSignedUrl
          fileId={user.avatar_url}
          fallbackText={user.full_name || user.username}
          size="xs"
          className="flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate">
            {user.full_name || user.username}
          </p>
        </div>
      </button>
      
      <Button
        size="sm"
        variant="ghost"
        onClick={handleUnfollow}
        disabled={unfollowLoading}
        className="opacity-0 group-hover:opacity-100 flex-shrink-0 h-5 w-5 p-0 hover:bg-red-50 hover:text-red-600"
      >
        <UserMinus className="h-3 w-3" />
      </Button>
    </div>
  );
};

interface FollowedRestaurantItemProps {
  restaurant: {
    id: string;
    name: string;
    image_url: string;
    cover_image_url: string;
    location: string;
    cuisine_type: string;
  };
  onUnfollow: (restaurantId: string) => void;
  unfollowLoading: boolean;
  onNavigate: () => void;
}

const FollowedRestaurantItem = ({ restaurant, onUnfollow, unfollowLoading, onNavigate }: FollowedRestaurantItemProps) => {
  const { updateFollowState } = useRestaurantFollowStats(restaurant.id);

  const handleUnfollow = () => {
    updateFollowState(false);
    onUnfollow(restaurant.id);
  };

  return (
    <div className="flex items-center space-x-2 p-1 rounded hover:bg-muted/50 transition-colors group">
      <button onClick={onNavigate} className="flex items-center space-x-2 flex-1 min-w-0">
        <AvatarWithSignedUrl
          fileId={restaurant.image_url || restaurant.cover_image_url}
          fallbackText={restaurant.name}
          size="xs"
          className="flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate">
            {restaurant.name}
          </p>
        </div>
      </button>
      
      <Button
        size="sm"
        variant="ghost"
        onClick={handleUnfollow}
        disabled={unfollowLoading}
        className="opacity-0 group-hover:opacity-100 flex-shrink-0 h-5 w-5 p-0 hover:bg-red-50 hover:text-red-600"
      >
        <UserMinus className="h-3 w-3" />
      </Button>
    </div>
  );
};
