
import { useParams } from 'react-router-dom';
import { Star, MapPin, Phone, Globe, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RestaurantReviewForm from '@/components/restaurant/RestaurantReviewForm';
import { useAuth } from '@/contexts/AuthContext';
import { restaurants } from '@/data/mockData';

const RestaurantDetail = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  
  // En una implementación real, buscarías en la base de datos
  const restaurant = restaurants.find(r => r.id === id);

  if (!restaurant) {
    return (
      <div className="max-w-4xl mx-auto text-center py-8">
        <h1 className="text-2xl font-bold text-muted-foreground">Restaurante no encontrado</h1>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < Math.floor(rating)
                ? "fill-yellow-400 text-yellow-400"
                : i < rating
                ? "fill-yellow-400 text-yellow-400 fill-opacity-50"
                : "text-muted-foreground"
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
        <img
          src={restaurant.imageUrl}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
          <div className="p-6 text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{restaurant.name}</h1>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-white text-black">
                {restaurant.cuisine}
              </Badge>
              {renderStars(restaurant.rating)}
              <span className="text-sm">({restaurant.reviewCount} reseñas)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info básica */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Información</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{restaurant.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>+34 123 456 789</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span>www.{restaurant.name.toLowerCase().replace(/\s+/g, '')}.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Lun-Dom: 12:00 - 23:00</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Sobre este lugar</h2>
          <p className="text-muted-foreground">{restaurant.description}</p>
        </div>
      </div>

      {/* Tabs para reseñas y más info */}
      <Tabs defaultValue="reviews" className="w-full">
        <TabsList>
          <TabsTrigger value="reviews">Reseñas</TabsTrigger>
          <TabsTrigger value="menu">Menú</TabsTrigger>
          <TabsTrigger value="photos">Fotos</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="space-y-6 mt-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Reseñas</h3>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">María García</p>
                      <div className="flex items-center gap-2">
                        {renderStars(4.5)}
                        <span className="text-sm text-muted-foreground">hace 2 días</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Excelente experiencia. La comida estaba deliciosa y el servicio fue impecable.
                    El ambiente es muy acogedor y perfecto para una cena romántica.
                  </p>
                </div>
              </div>
            </div>

            {isAuthenticated && (
              <div>
                <RestaurantReviewForm 
                  restaurantId={restaurant.id}
                  onSuccess={() => {
                    // Refrescar reseñas
                    console.log('Reseña enviada exitosamente');
                  }}
                />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="menu" className="mt-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Menú próximamente disponible</p>
          </div>
        </TabsContent>

        <TabsContent value="photos" className="mt-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Galería de fotos próximamente disponible</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RestaurantDetail;
