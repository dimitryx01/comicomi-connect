
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import RecipeCard from '@/components/recipe/RecipeCard';
import RestaurantCard from '@/components/restaurant/RestaurantCard';
import { useRecipesWithoutAuth } from '@/hooks/useRecipesWithoutAuth';

const Discover = () => {
  const [activeTab, setActiveTab] = useState("recipes");
  const [searchTerm, setSearchTerm] = useState("");
  const { recipes, loading: recipesLoading } = useRecipesWithoutAuth();

  const filteredRecipes = recipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mock data for restaurants - replace with actual data when available
  const mockRestaurants = [
    {
      id: "1",
      name: "La Terraza Mediterránea",
      description: "Auténtica cocina mediterránea en el corazón de Madrid",
      address: "Centro Histórico, Madrid",
      location: "Madrid",
      imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop",
      coverImageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop",
      cuisineType: "Mediterránea",
      averageRating: 4.5,
      reviewsCount: 127,
      isVerified: true,
      phone: "+34 912 345 678",
      website: "https://laterrazamediterranea.com"
    },
    {
      id: "2", 
      name: "Sushi Zen",
      description: "Experiencia culinaria japonesa única",
      address: "Salamanca, Madrid",
      location: "Madrid",
      imageUrl: "https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=400&h=300&fit=crop",
      coverImageUrl: "https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=400&h=300&fit=crop",
      cuisineType: "Japonesa",
      averageRating: 4.8,
      reviewsCount: 89,
      isVerified: true,
      phone: "+34 913 456 789",
      website: "https://sushizen.com"
    }
  ];

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
            placeholder="Buscar recetas, restaurantes..."
            className="pl-10 pr-4"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center">
          <TabsList className="grid w-full max-w-[400px] grid-cols-2">
            <TabsTrigger value="recipes">Recetas</TabsTrigger>
            <TabsTrigger value="restaurants">Restaurantes</TabsTrigger>
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
              {filteredRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  id={recipe.id}
                  title={recipe.title}
                  author={recipe.author_name || 'Usuario'}
                  authorUsername={recipe.author_name || ''}
                  authorAvatar={''}
                  authorId={recipe.author_id || ''}
                  image={recipe.image_url}
                  prepTime={recipe.prep_time + recipe.cook_time}
                  difficulty={recipe.difficulty}
                  rating={0}
                  saves={0}
                  cheersCount={0}
                  hasVideo={false}
                />
              ))}
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                id={restaurant.id}
                name={restaurant.name}
                description={restaurant.description}
                imageUrl={restaurant.imageUrl}
                coverImageUrl={restaurant.coverImageUrl}
                cuisineType={restaurant.cuisineType}
                address={restaurant.address}
                location={restaurant.location}
                phone={restaurant.phone}
                website={restaurant.website}
                averageRating={restaurant.averageRating}
                reviewsCount={restaurant.reviewsCount}
                isVerified={restaurant.isVerified}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Discover;
