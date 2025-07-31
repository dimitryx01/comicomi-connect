
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import RecipeCard from '@/components/recipe/RecipeCard';
import RestaurantCard from '@/components/restaurant/RestaurantCard';
import { PublicUserCard } from '@/components/user/PublicUserCard';
import { useRecipesEnhanced } from '@/hooks/useRecipesEnhanced';
import { useRestaurants } from '@/hooks/useRestaurants';
import { usePublicUsers } from '@/hooks/usePublicUsers';
import { useSavedRestaurants } from '@/hooks/useSavedRestaurants';

const Discover = () => {
  const [activeTab, setActiveTab] = useState("recipes");
  const [searchTerm, setSearchTerm] = useState("");
  const { recipes, loading: recipesLoading } = useRecipesEnhanced();
  const { restaurants, loading: restaurantsLoading } = useRestaurants();
  const { users, loading: usersLoading } = usePublicUsers();
  const { toggleSave, isSaved } = useSavedRestaurants();

  const filteredRecipes = recipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.cuisine_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveToggle = async (restaurantId: string) => {
    await toggleSave(restaurantId);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Descubre</h1>
        <p className="text-xl text-muted-foreground">
          Explora las mejores recetas y restaurantes de nuestra comunidad
        </p>
        
        {/* Barra de búsqueda */}
        <div className="max-w-md mx-auto relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar recetas, restaurantes, personas..."
            className="pl-10 pr-4"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center">
          <TabsList className="grid w-full max-w-[600px] grid-cols-3">
            <TabsTrigger value="recipes">Recetas</TabsTrigger>
            <TabsTrigger value="restaurants">Restaurantes</TabsTrigger>
            <TabsTrigger value="people">Personas</TabsTrigger>
          </TabsList>
          
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>

        <TabsContent value="recipes" className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Recetas Destacadas</h2>
            <p className="text-muted-foreground">
              Descubre las creaciones más populares de nuestra comunidad
            </p>
          </div>
          
          {recipesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecipes.length > 0 ? (
                filteredRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    id={recipe.id}
                    title={recipe.title}
                    author={recipe.author_name || 'Usuario'}
                    authorUsername={recipe.author_username || recipe.author_name || 'usuario'}
                    authorAvatar={recipe.author_avatar_url}
                    authorId={recipe.author_id || ''}
                    image={recipe.image_url}
                    prepTime={(recipe.prep_time || 0) + (recipe.cook_time || 0)}
                    difficulty={recipe.difficulty || 'Medio'}
                    rating={4.5}
                    saves={recipe.saves_count || 0}
                    cheersCount={recipe.cheers_count || 0}
                    hasVideo={false}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">
                    {searchTerm ? 'No se encontraron recetas que coincidan con la búsqueda' : 'No hay recetas disponibles'}
                  </p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="restaurants" className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Restaurantes Recomendados</h2>
            <p className="text-muted-foreground">
              Los mejores lugares para comer según nuestra comunidad
            </p>
          </div>
          
          {restaurantsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRestaurants.length > 0 ? (
                filteredRestaurants.map((restaurant) => (
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
                    isSaved={isSaved(restaurant.id)}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">
                    {searchTerm ? 'No se encontraron restaurantes que coincidan con la búsqueda' : 'No hay restaurantes disponibles'}
                  </p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="people" className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Descubre Personas</h2>
            <p className="text-muted-foreground">
              Conecta con otros amantes de la cocina en nuestra comunidad
            </p>
          </div>
          
          {usersLoading ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="h-10 w-10 bg-muted animate-pulse rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded w-1/3" />
                    <div className="h-3 bg-muted animate-pulse rounded w-1/4" />
                  </div>
                  <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <PublicUserCard key={user.id} user={user} />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {searchTerm ? 'No se encontraron personas que coincidan con la búsqueda' : 'No hay usuarios disponibles'}
                  </p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Discover;
