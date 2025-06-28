
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AvatarWithSignedUrl } from '@/components/ui/AvatarWithSignedUrl';
import { useFollowing } from '@/hooks/useFollowing';
import { useFollowSystem } from '@/hooks/useFollowSystem';
import { useUserFollowStats } from '@/hooks/useFollowStats';
import { useRestaurantFollowStats } from '@/hooks/useFollowStats';
import { Users, MapPin, UserMinus, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const FollowingSidebar = () => {
  const { followedUsers, followedRestaurants, loading, error, refetch } = useFollowing();
  const { unfollowUser, unfollowRestaurant, loading: unfollowLoading } = useFollowSystem();
  const navigate = useNavigate();

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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Siguiendo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Siguiendo</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const hasFollowing = followedUsers.length > 0 || followedRestaurants.length > 0;

  if (!hasFollowing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Siguiendo</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              No sigues a nadie aún
            </p>
            <p className="text-xs text-muted-foreground">
              Explora perfiles y restaurantes para empezar a seguir
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Siguiendo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {followedUsers.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center text-sm font-medium text-muted-foreground">
              <Users className="h-4 w-4 mr-1" />
              Personas ({followedUsers.length})
            </div>
            <div className="space-y-2">
              {followedUsers.map((user) => (
                <FollowedUserItem
                  key={user.id}
                  user={user}
                  onUnfollow={handleUnfollowUser}
                  unfollowLoading={unfollowLoading}
                  onNavigate={() => navigate(`/profile/${user.username}`)}
                />
              ))}
            </div>
          </div>
        )}

        {followedRestaurants.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center text-sm font-medium text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              Restaurantes ({followedRestaurants.length})
            </div>
            <div className="space-y-2">
              {followedRestaurants.map((restaurant) => (
                <FollowedRestaurantItem
                  key={restaurant.id}
                  restaurant={restaurant}
                  onUnfollow={handleUnfollowRestaurant}
                  unfollowLoading={unfollowLoading}
                  onNavigate={() => navigate(`/restaurants/${restaurant.id}`)}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
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
    <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
      <button onClick={onNavigate} className="flex items-center space-x-3 flex-1 min-w-0">
        <AvatarWithSignedUrl
          fileId={user.avatar_url}
          fallbackText={user.full_name || user.username}
          size="sm"
          className="flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {user.full_name || user.username}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            @{user.username}
          </p>
        </div>
      </button>
      
      <Button
        size="sm"
        variant="ghost"
        onClick={handleUnfollow}
        disabled={unfollowLoading}
        className="flex-shrink-0 h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
      >
        <UserMinus className="h-4 w-4" />
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
    <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
      <button onClick={onNavigate} className="flex items-center space-x-3 flex-1 min-w-0">
        <AvatarWithSignedUrl
          fileId={restaurant.image_url || restaurant.cover_image_url}
          fallbackText={restaurant.name}
          size="sm"
          className="flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {restaurant.name}
          </p>
          {restaurant.cuisine_type && (
            <p className="text-xs text-muted-foreground truncate">
              {restaurant.cuisine_type}
            </p>
          )}
          {restaurant.location && (
            <p className="text-xs text-muted-foreground truncate">
              <MapPin className="h-3 w-3 inline mr-1" />
              {restaurant.location}
            </p>
          )}
        </div>
      </button>
      
      <Button
        size="sm"
        variant="ghost"
        onClick={handleUnfollow}
        disabled={unfollowLoading}
        className="flex-shrink-0 h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
      >
        <UserMinus className="h-4 w-4" />
      </Button>
    </div>
  );
};
