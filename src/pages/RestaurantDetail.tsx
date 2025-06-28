
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Phone, Globe, Star, ArrowLeft, Heart, Users, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SaveButton } from '@/components/ui/SaveButton';
import { FollowButton } from '@/components/follow/FollowButton';
import RestaurantReviewForm from '@/components/restaurant/RestaurantReviewForm';
import { useSavedRestaurants } from '@/hooks/useSavedRestaurants';
import { useRestaurantFollowStats } from '@/hooks/useFollowStats';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const RestaurantDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isSaveLoading, setIsSaveLoading] = useState(false);

  const { toggleSave, isSaved } = useSavedRestaurants();
  const { followersCount, isFollowing, updateFollowState } = useRestaurantFollowStats(id);

  useEffect(() => {
    if (id) {
      fetchRestaurant();
      fetchReviews();
    }
  }, [id]);

  const fetchRestaurant = async () => {
    if (!id) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setRestaurant(data);
      } else {
        toast({
          title: "Restaurante no encontrado",
          description: "El restaurante que buscas no existe o no está disponible",
          variant: "destructive"
        });
        navigate('/restaurants');
      }
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el restaurante",
        variant: "destructive"
      });
      navigate('/restaurants');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('restaurant_reviews')
        .select(`
          *,
          users!restaurant_reviews_user_id_fkey (
            id,
            full_name,
            username,
            avatar_url
          )
        `)
        .eq('restaurant_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleSaveClick = async () => {
    if (!id) return;
    setIsSaveLoading(true);
    try {
      await toggleSave(id);
    } finally {
      setIsSaveLoading(false);
    }
  };

  const handleFollowChange = (newIsFollowing: boolean) => {
    updateFollowState(newIsFollowing);
  };

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    fetchReviews();
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + (review.overall_rating || 0), 0) / reviews.length
    : 0;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl text-center">
        <p>Restaurante no encontrado</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header con botón de regresar */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold flex-1">{restaurant.name}</h1>
        <div className="flex items-center gap-2">
          {user && (
            <SaveButton
              isSaved={isSaved(restaurant.id)}
              onToggle={handleSaveClick}
              loading={isSaveLoading}
              size="default"
            />
          )}
          <FollowButton
            type="restaurant"
            targetId={restaurant.id}
            isFollowing={isFollowing}
            onFollowChange={handleFollowChange}
          />
        </div>
      </div>

      {/* Imagen de portada */}
      {restaurant.cover_image_url && (
        <div className="relative h-80 rounded-xl overflow-hidden mb-6">
          <img 
            src={restaurant.cover_image_url} 
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          {restaurant.is_verified && (
            <div className="absolute top-4 left-4">
              <Badge className="bg-blue-500 text-white">
                <Star className="h-3 w-3 mr-1 fill-current" />
                Verificado
              </Badge>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contenido principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información básica */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{restaurant.name}</CardTitle>
              {restaurant.description && (
                <p className="text-muted-foreground">{restaurant.description}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {restaurant.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{restaurant.address}</span>
                </div>
              )}
              
              {restaurant.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{restaurant.phone}</span>
                </div>
              )}
              
              {restaurant.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={restaurant.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Sitio web
                  </a>
                </div>
              )}

              {restaurant.cuisine_type && (
                <div className="pt-2">
                  <Badge variant="outline">{restaurant.cuisine_type}</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reseñas */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Reseñas ({reviews.length})</CardTitle>
              {user && (
                <Button onClick={() => setShowReviewForm(true)}>
                  Escribir reseña
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{review.users?.full_name}</span>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="ml-1 text-sm">{review.overall_rating?.toFixed(1)}</span>
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-muted-foreground">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No hay reseñas aún. ¡Sé el primero en escribir una!
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Estadísticas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <Star className="h-5 w-5 mx-auto mb-1 text-yellow-500 fill-current" />
                <p className="text-sm font-medium">
                  {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">Calificación</p>
              </div>
              
              <div className="text-center p-3 bg-muted rounded-lg">
                <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-sm font-medium">{followersCount}</p>
                <p className="text-xs text-muted-foreground">Seguidores</p>
              </div>

              <div className="text-center p-3 bg-muted rounded-lg">
                <Heart className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-sm font-medium">{reviews.length}</p>
                <p className="text-xs text-muted-foreground">Reseñas</p>
              </div>
            </CardContent>
          </Card>

          {/* Horarios (si están disponibles) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Horarios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Información no disponible</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Formulario de reseña */}
      {showReviewForm && (
        <div className="mt-8">
          <Separator className="mb-6" />
          <Card>
            <CardHeader>
              <CardTitle>Escribir una reseña</CardTitle>
            </CardHeader>
            <CardContent>
              <RestaurantReviewForm
                restaurantId={restaurant.id}
                restaurantName={restaurant.name}
                onReviewSubmitted={handleReviewSubmitted}
                onCancel={() => setShowReviewForm(false)}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RestaurantDetail;
