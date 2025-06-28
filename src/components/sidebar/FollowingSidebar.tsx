
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
  const [showUsers, setShowUsers] = useState(true);
  const [showRestaurants, setShowRestaurants] = useState(true);

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
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Siguiendo</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3 p-4 border rounded-lg">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Siguiendo</h1>
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Error al cargar los datos</p>
        </div>
      </div>
    );
  }

  const hasFollowing = followedUsers.length > 0 || followedRestaurants.length > 0;

  if (!hasFollowing) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Siguiendo</h1>
        <div className="text-center py-8">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">No sigues a nadie aún</p>
          <p className="text-sm text-muted-foreground">
            Descubre personas y restaurantes interesantes en la sección Discover
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold">Siguiendo</h1>
      
      {followedUsers.length > 0 && (
        <div className="space-y-4">
          <button
            onClick={() => setShowUsers(!showUsers)}
            className="flex items-center text-lg font-semibold hover:text-primary w-full"
          >
            {showUsers ? <ChevronDown className="h-5 w-5 mr-2" /> : <ChevronRight className="h-5 w-5 mr-2" />}
            <Users className="h-5 w-5 mr-2" />
            Personas ({followedUsers.length})
          </button>
          {showUsers && (
            <div className="grid gap-4">
              {followedUsers.map((user) => (
                <FollowedUserCard
                  key={user.id}
                  user={user}
                  onUnfollow={handleUnfollowUser}
                  unfollowLoading={unfollowLoading}
                  onNavigate={() => navigate(`/profile/${user.username}`)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {followedRestaurants.length > 0 && (
        <div className="space-y-4">
          <button
            onClick={() => setShowRestaurants(!showRestaurants)}
            className="flex items-center text-lg font-semibold hover:text-primary w-full"
          >
            {showRestaurants ? <ChevronDown className="h-5 w-5 mr-2" /> : <ChevronRight className="h-5 w-5 mr-2" />}
            <MapPin className="h-5 w-5 mr-2" />
            Restaurantes ({followedRestaurants.length})
          </button>
          {showRestaurants && (
            <div className="grid gap-4">
              {followedRestaurants.map((restaurant) => (
                <FollowedRestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  onUnfollow={handleUnfollowRestaurant}
                  unfollowLoading={unfollowLoading}
                  onNavigate={() => navigate(`/restaurants/${restaurant.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface FollowedUserCardProps {
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

const FollowedUserCard = ({ user, onUnfollow, unfollowLoading, onNavigate }: FollowedUserCardProps) => {
  const { updateFollowState } = useUserFollowStats(user.id);

  const handleUnfollow = () => {
    updateFollowState(false);
    onUnfollow(user.id);
  };

  return (
    <div className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors group">
      <button onClick={onNavigate} className="flex items-center space-x-4 flex-1 min-w-0">
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
      </button>
      
      <Button
        size="sm"
        variant="outline"
        onClick={handleUnfollow}
        disabled={unfollowLoading}
        className="flex-shrink-0 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
      >
        <UserMinus className="h-4 w-4 mr-1" />
        Dejar de seguir
      </Button>
    </div>
  );
};

interface FollowedRestaurantCardProps {
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

const FollowedRestaurantCard = ({ restaurant, onUnfollow, unfollowLoading, onNavigate }: FollowedRestaurantCardProps) => {
  const { updateFollowState } = useRestaurantFollowStats(restaurant.id);

  const handleUnfollow = () => {
    updateFollowState(false);
    onUnfollow(restaurant.id);
  };

  return (
    <div className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors group">
      <button onClick={onNavigate} className="flex items-center space-x-4 flex-1 min-w-0">
        <AvatarWithSignedUrl
          fileId={restaurant.image_url || restaurant.cover_image_url}
          fallbackText={restaurant.name}
          size="sm"
          className="flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">
            {restaurant.name}
          </p>
          <p className="text-sm text-muted-foreground truncate">
            {restaurant.location} • {restaurant.cuisine_type}
          </p>
        </div>
      </button>
      
      <Button
        size="sm"
        variant="outline"
        onClick={handleUnfollow}
        disabled={unfollowLoading}
        className="flex-shrink-0 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
      >
        <UserMinus className="h-4 w-4 mr-1" />
        Dejar de seguir
      </Button>
    </div>
  );
};
