
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRandomRestaurants } from '@/hooks/useRandomRestaurants';
import { useFollowSystem } from '@/hooks/useFollowSystem';
import { useRestaurantFollowStats } from '@/hooks/useFollowStats';
import { AvatarWithSignedUrl } from '@/components/ui/AvatarWithSignedUrl';
import { MapPin, Users, RefreshCw, AlertCircle } from 'lucide-react';
import { memo } from 'react';

export const RandomRestaurantsSidebar = memo(() => {
  const { restaurants, loading, error, refetch } = useRandomRestaurants();
  const { followRestaurant, unfollowRestaurant, loading: followLoading } = useFollowSystem();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Restaurantes para descubrir</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center space-x-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
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
          <CardTitle className="text-lg flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Restaurantes para descubrir
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-3">{error}</p>
          <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Intentar de nuevo
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (restaurants.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Restaurantes para descubrir
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              No encontramos restaurantes en tu zona
            </p>
            <p className="text-xs text-muted-foreground">
              Actualiza tu ubicación en el perfil para ver sugerencias personalizadas
            </p>
            <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Buscar de nuevo
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Restaurantes para descubrir
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Encuentra restaurantes nuevos en tu ciudad
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {restaurants.map((restaurant) => (
          <RestaurantSuggestionItem
            key={restaurant.id}
            restaurant={restaurant}
            onFollow={followRestaurant}
            onUnfollow={unfollowRestaurant}
            followLoading={followLoading}
          />
        ))}
        
        <div className="pt-2 border-t">
          <Button variant="ghost" size="sm" onClick={refetch} disabled={loading} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Ver más sugerencias
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

RandomRestaurantsSidebar.displayName = 'RandomRestaurantsSidebar';

interface RestaurantSuggestionItemProps {
  restaurant: {
    id: string;
    name: string;
    description: string;
    image_url: string;
    cover_image_url: string;
    location: string;
    cuisine_type: string;
    followers_count: number;
  };
  onFollow: (restaurantId: string) => Promise<boolean>;
  onUnfollow: (restaurantId: string) => Promise<boolean>;
  followLoading: boolean;
}

const RestaurantSuggestionItem = memo(({ 
  restaurant, 
  onFollow, 
  onUnfollow, 
  followLoading 
}: RestaurantSuggestionItemProps) => {
  const { isFollowing, loading: statsLoading, refreshStats } = useRestaurantFollowStats(restaurant.id);

  const handleFollow = async () => {
    const success = await onFollow(restaurant.id);
    if (success) {
      refreshStats();
    }
  };

  const handleUnfollow = async () => {
    const success = await onUnfollow(restaurant.id);
    if (success) {
      refreshStats();
    }
  };

  return (
    <div className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
      <AvatarWithSignedUrl
        fileId={restaurant.image_url || restaurant.cover_image_url}
        fallbackText={restaurant.name}
        size="md"
        className="flex-shrink-0"
      />
      
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate">
          {restaurant.name}
        </h4>
        
        {restaurant.cuisine_type && (
          <p className="text-xs text-muted-foreground">
            {restaurant.cuisine_type}
          </p>
        )}
        
        {restaurant.location && (
          <p className="text-xs text-muted-foreground truncate">
            <MapPin className="h-3 w-3 inline mr-1" />
            {restaurant.location}
          </p>
        )}
        
        {restaurant.followers_count > 0 && (
          <p className="text-xs text-muted-foreground">
            <Users className="h-3 w-3 inline mr-1" />
            {restaurant.followers_count} seguidores
          </p>
        )}
      </div>
      
      <Button
        size="sm"
        variant={isFollowing ? "outline" : "default"}
        onClick={isFollowing ? handleUnfollow : handleFollow}
        disabled={followLoading || statsLoading}
        className="flex-shrink-0 text-xs px-3 py-1 h-7"
      >
        {isFollowing ? 'Siguiendo' : 'Seguir'}
      </Button>
    </div>
  );
});

RestaurantSuggestionItem.displayName = 'RestaurantSuggestionItem';
