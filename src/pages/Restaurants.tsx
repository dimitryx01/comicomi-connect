
import { useState } from 'react';
import { Search, Filter, MapPin, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RestaurantCard from '@/components/restaurant/RestaurantCard';
import { useRestaurants } from '@/hooks/useRestaurants';
import PageLayout from '@/components/layout/PageLayout';

const Restaurants = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [minRating, setMinRating] = useState<number>(0);
  const [orderBy, setOrderBy] = useState<'name' | 'created_at' | 'average_rating' | 'reviews_count'>('created_at');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { restaurants, loading, refreshRestaurants } = useRestaurants({
    cuisine_type: selectedCuisine !== 'all' ? selectedCuisine : undefined,
    location: selectedLocation || undefined,
    min_rating: minRating || undefined,
    order_by: orderBy,
    order_direction: orderBy === 'name' ? 'asc' : 'desc'
  });

  // Filter restaurants by search term locally
  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const cuisineTypes = [
    'Mediterránea', 'Italiana', 'Japonesa', 'Mexicana', 'China', 'India', 'Francesa',
    'Española', 'Americana', 'Árabe', 'Tailandesa', 'Peruana', 'Argentina', 'Vegetariana'
  ];

  const handleSaveToggle = (restaurantId: string) => {
    // TODO: Implement save/unsave functionality
    console.log('Toggle save for restaurant:', restaurantId);
  };

  if (loading && restaurants.length === 0) {
    return (
      <PageLayout>
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Restaurantes</h1>
          {/* Skeleton for filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-10 bg-gray-200 rounded flex-1 animate-pulse"></div>
              ))}
            </div>
          </div>
          
          {/* Skeleton for restaurant cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="h-48 bg-gray-200 animate-pulse"></div>
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Restaurantes</h1>
        
        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar restaurantes por nombre, descripción o ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Select value={selectedCuisine} onValueChange={setSelectedCuisine}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de cocina" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {cuisineTypes.map(cuisine => (
                    <SelectItem key={cuisine} value={cuisine}>
                      {cuisine}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Ciudad"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={minRating.toString()} onValueChange={(value) => setMinRating(Number(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Puntuación mín." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Cualquier puntuación</SelectItem>
                  <SelectItem value="1">1+ estrellas</SelectItem>
                  <SelectItem value="2">2+ estrellas</SelectItem>
                  <SelectItem value="3">3+ estrellas</SelectItem>
                  <SelectItem value="4">4+ estrellas</SelectItem>
                </SelectContent>
              </Select>

              <Select value={orderBy} onValueChange={(value: any) => setOrderBy(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Más recientes</SelectItem>
                  <SelectItem value="average_rating">Mejor calificados</SelectItem>
                  <SelectItem value="reviews_count">Más populares</SelectItem>
                  <SelectItem value="name">Nombre A-Z</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="flex-1"
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="flex-1"
                >
                  Lista
                </Button>
              </div>
            </div>

            {/* Active Filters */}
            {(selectedCuisine !== 'all' || selectedLocation || minRating > 0) && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-600">Filtros activos:</span>
                {selectedCuisine !== 'all' && (
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedCuisine('all')}>
                    {selectedCuisine} ×
                  </Badge>
                )}
                {selectedLocation && (
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedLocation('')}>
                    📍 {selectedLocation} ×
                  </Badge>
                )}
                {minRating > 0 && (
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => setMinRating(0)}>
                    ⭐ {minRating}+ estrellas ×
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              {filteredRestaurants.length} restaurante{filteredRestaurants.length !== 1 ? 's' : ''} encontrado{filteredRestaurants.length !== 1 ? 's' : ''}
            </h2>
            {searchTerm && (
              <p className="text-gray-600 text-sm">
                Resultados para "{searchTerm}"
              </p>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={refreshRestaurants}>
            Actualizar
          </Button>
        </div>

        {/* Restaurant Grid/List */}
        {filteredRestaurants.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-xl font-semibold mb-2">No se encontraron restaurantes</h3>
              <p className="text-gray-600 mb-4">
                Intenta ajustar tus filtros o buscar en otra ubicación
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCuisine('all');
                  setSelectedLocation('');
                  setMinRating(0);
                }}
              >
                Limpiar filtros
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
          }>
            {filteredRestaurants.map(restaurant => (
              <RestaurantCard
                key={restaurant.id}
                id={restaurant.id}
                name={restaurant.name}
                description={restaurant.description}
                imageUrl={restaurant.image_url}
                coverImageUrl={restaurant.cover_image_url}
                cuisineType={restaurant.cuisine_type}
                address={restaurant.address}
                location={restaurant.location}
                phone={restaurant.phone}
                website={restaurant.website}
                averageRating={restaurant.average_rating}
                reviewsCount={restaurant.reviews_count}
                isVerified={restaurant.is_verified}
                onSaveToggle={handleSaveToggle}
                isSaved={false} // TODO: Implement saved state
              />
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default Restaurants;
