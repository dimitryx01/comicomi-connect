import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Star, 
  Phone, 
  Globe, 
  Mail, 
  Clock, 
  Bookmark,
  Share2,
  Flag,
  Camera,
  Settings,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRestaurant } from '@/hooks/useRestaurants';
import { useAuth } from '@/contexts/AuthContext';
import RestaurantReviewForm from '@/components/restaurant/RestaurantReviewForm';
import PageLayout from '@/components/layout/PageLayout';
import { FollowButton } from '@/components/follow/FollowButton';
import { useRestaurantFollowStats } from '@/hooks/useFollowStats';
import { useSavedRestaurants } from '@/hooks/useSavedRestaurants';
import { useToast } from '@/hooks/use-toast';

const RestaurantDetailComponent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Memoize restaurant ID to prevent unnecessary re-renders
  const restaurantId = useMemo(() => id, [id]);

  const { restaurant, loading, error, refreshRestaurant } = useRestaurant(restaurantId!);
  
  // Hook para estadu00edsticas de seguimiento del restaurante - OPTIMIZADO
  const { followersCount, isFollowing, loading: followStatsLoading, refreshStats, updateFollowState } = useRestaurantFollowStats(restaurantId);

  // Hook para funcionalidad de guardar restaurantes
  const { toggleSave, isSaved } = useSavedRestaurants();

  // OPTIMIZADO: Memoizar funciu00f3n de manejo de cambio de estado de seguimiento
  const handleFollowChange = useCallback((newFollowingState: boolean) => {
    if (!restaurantId) return;
    
    // Actualizar inmediatamente el estado local sin necesidad de refrescar
    updateFollowState(newFollowingState);
    
    // No usamos setTimeout para evitar re-renderizados innecesarios
  }, [restaurantId, updateFollowState]);

  // Memoizar funciu00f3n de guardar/desguardar
  const handleSaveToggle = useCallback(async () => {
    if (!restaurantId) return;
    const success = await toggleSave(restaurantId);
    if (success) {
      const isNowSaved = isSaved(restaurantId);
      toast({
        title: isNowSaved ? "Restaurante guardado" : "Restaurante eliminado de guardados",
        description: isNowSaved ? "Se ha agregado a tus guardados" : "Se ha eliminado de tus guardados"
      });
    }
  }, [restaurantId, toggleSave, isSaved, toast]);

  // Memoizar funciu00f3n de compartir
  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: restaurant?.name || 'Restaurante',
        text: restaurant?.description || `Echa un vistazo a ${restaurant?.name || 'este restaurante'}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Enlace copiado",
        description: "El enlace del restaurante se ha copiado al portapapeles"
      });
    }
  }, [restaurant?.name, restaurant?.description, toast]);

  // Memoizar contenido de loading
  const loadingContent = useMemo(() => (
    <PageLayout>
      <div className="space-y-6">
        {/* Cover Image Skeleton */}
        <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
        
        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </PageLayout>
  ), []);

  // Memoizar contenido de error
  const errorContent = useMemo(() => (
    <PageLayout>
      <Card>
        <CardContent className="p-12 text-center">
          <div className="text-6xl mb-4">ud83dude1e</div>
          <h3 className="text-xl font-semibold mb-2">Restaurante no encontrado</h3>
          <p className="text-gray-600 mb-4">
            El restaurante que buscas no existe o ha sido eliminado.
          </p>
          <Button onClick={() => navigate('/restaurants')}>
            Ver todos los restaurantes
          </Button>
        </CardContent>
      </Card>
    </PageLayout>
  ), [navigate]);

  if (loading) {
    return loadingContent;
  }

  if (error || !restaurant) {
    return errorContent;
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Cover Image */}
        <div className="relative h-64 bg-gradient-to-br from-orange-200 to-red-300 rounded-lg overflow-hidden">
          {restaurant.cover_image_url || restaurant.image_url ? (
            <img
              src={restaurant.cover_image_url || restaurant.image_url}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white">
              <div className="text-center">
                <div className="text-6xl mb-2">ud83cudf7dufe0f</div>
                <p className="text-xl font-semibold">{restaurant.name}</p>
              </div>
            </div>
          )}
          
          {/* Overlay Actions */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleSaveToggle}
              className={isSaved(restaurant.id) ? 'bg-blue-100 text-blue-600' : ''}
            >
              <Bookmark className={`h-4 w-4 ${isSaved(restaurant.id) ? 'fill-current' : ''}`} />
            </Button>
            <Button variant="secondary" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {restaurant.is_verified && (
            <div className="absolute top-4 left-4">
              <Badge className="bg-blue-500 text-white">
                <Star className="h-3 w-3 mr-1 fill-current" />
                Verificado
              </Badge>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {restaurant.name}
                  </h1>
                  <div className="flex items-center gap-4 text-gray-600 mb-3">
                    {restaurant.cuisine_type && (
                      <Badge variant="secondary">{restaurant.cuisine_type}</Badge>
                    )}
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-medium">
                        {restaurant.average_rating > 0 ? restaurant.average_rating.toFixed(1) : 'N/A'}
                      </span>
                      <span className="text-sm">
                        ({restaurant.reviews_count} reseu00f1a{restaurant.reviews_count !== 1 ? 's' : ''})
                      </span>
                    </div>
                  </div>
                  
                  {/* Estadu00edsticas de seguimiento y botu00f3n seguir - OPTIMIZADO */}
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-sm text-muted-foreground">
                      {followStatsLoading ? '...' : followersCount} seguidores
                    </span>
                    
                    {user && (
                      <FollowButton
                        type="restaurant"
                        targetId={restaurant.id}
                        isFollowing={isFollowing}
                        onFollowChange={handleFollowChange}
                        size="sm"
                      />
                    )}
                  </div>
                </div>
              </div>

              {restaurant.description && (
                <p className="text-gray-700 text-lg leading-relaxed">
                  {restaurant.description}
                </p>
              )}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="reviews" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="reviews">Reseu00f1as</TabsTrigger>
                <TabsTrigger value="menu">Menu00fa</TabsTrigger>
                <TabsTrigger value="gallery">Galeru00eda</TabsTrigger>
                <TabsTrigger value="events">Eventos</TabsTrigger>
              </TabsList>

              <TabsContent value="reviews" className="space-y-6">
                {/* Review Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Reseu00f1as de clientes</span>
                      {user && (
                        <Button onClick={() => setShowReviewForm(!showReviewForm)}>
                          {showReviewForm ? 'Cancelar' : 'Escribir reseu00f1a'}
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-orange-600">ud83cudf7dufe0f</div>
                        <div className="text-sm font-medium">Comida</div>
                        <div className="text-sm text-gray-600">N/A</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">ud83eudd1d</div>
                        <div className="text-sm font-medium">Servicio</div>
                        <div className="text-sm text-gray-600">N/A</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">ud83cudf76</div>
                        <div className="text-sm font-medium">Ambiente</div>
                        <div className="text-sm text-gray-600">N/A</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">ud83euddfc</div>
                        <div className="text-sm font-medium">Limpieza</div>
                        <div className="text-sm text-gray-600">N/A</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-yellow-600">ud83dudcb0</div>
                        <div className="text-sm font-medium">Precio</div>
                        <div className="text-sm text-gray-600">N/A</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Review Form */}
                {showReviewForm && (
                  <RestaurantReviewForm
                    restaurantId={restaurant.id}
                    restaurantName={restaurant.name}
                    onReviewSubmitted={() => {
                      setShowReviewForm(false);
                      refreshRestaurant();
                    }}
                    onCancel={() => setShowReviewForm(false)}
                  />
                )}

                {/* Reviews List */}
                {restaurant.reviews_count === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <div className="text-4xl mb-4">ud83dudcac</div>
                      <h3 className="font-semibold mb-2">No hay reseu00f1as au00fan</h3>
                      <p className="text-gray-600 mb-4">
                        Su00e9 el primero en compartir tu experiencia
                      </p>
                      {user && (
                        <Button onClick={() => setShowReviewForm(true)}>
                          Escribir primera reseu00f1a
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    <p className="text-center text-gray-600">
                      Las reseu00f1as apareceru00e1n aquu00ed pru00f3ximamente
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="menu">
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="text-4xl mb-4">ud83dudccb</div>
                    <h3 className="font-semibold mb-2">Menu00fa pru00f3ximamente</h3>
                    <p className="text-gray-600">
                      El menu00fa de este restaurante estaru00e1 disponible pronto
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="gallery">
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="text-4xl mb-4">ud83dudcf8</div>
                    <h3 className="font-semibold mb-2">Galeru00eda pru00f3ximamente</h3>
                    <p className="text-gray-600">
                      Las fotos del restaurante estaru00e1n disponibles pronto
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="events">
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="text-4xl mb-4">ud83cudf89</div>
                    <h3 className="font-semibold mb-2">Eventos pru00f3ximamente</h3>
                    <p className="text-gray-600">
                      Los eventos y promociones apareceru00e1n aquu00ed pronto
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informaciu00f3n de contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {restaurant.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Direcciu00f3n</p>
                      <p className="text-sm text-gray-600">{restaurant.address}</p>
                    </div>
                  </div>
                )}

                {restaurant.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Telu00e9fono</p>
                      <a 
                        href={`tel:${restaurant.phone}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {restaurant.phone}
                      </a>
                    </div>
                  </div>
                )}

                {restaurant.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Email</p>
                      <a 
                        href={`mailto:${restaurant.email}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {restaurant.email}
                      </a>
                    </div>
                  </div>
                )}

                {restaurant.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Sitio web</p>
                      <a 
                        href={restaurant.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Visitar sitio web
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Admin Section */}
            <Card>
              <CardHeader>
                <CardTitle>u00bfAdministras este sitio?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Si eres el propietario o administrador de este restaurante, puedes gestionar su informaciu00f3n.
                </p>
                <Button variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Solicitar acceso
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones ru00e1pidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartir restaurante
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Flag className="h-4 w-4 mr-2" />
                  Reportar problema
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

// Usar memo para evitar re-renderizados innecesarios
const RestaurantDetail = memo(RestaurantDetailComponent);

export default RestaurantDetail;