
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { Search, MapPin, ChefHat, X } from 'lucide-react';

interface Restaurant {
  id: string;
  name: string;
  location?: string;
}

interface Recipe {
  id: string;
  title: string;
  author_id: string;
}

interface TagSelectorProps {
  selectedRestaurant: Restaurant | null;
  selectedRecipe: Recipe | null;
  onRestaurantSelect: (restaurant: Restaurant | null) => void;
  onRecipeSelect: (recipe: Recipe | null) => void;
}

export const TagSelector = ({
  selectedRestaurant,
  selectedRecipe,
  onRestaurantSelect,
  onRecipeSelect
}: TagSelectorProps) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [restaurantSearch, setRestaurantSearch] = useState('');
  const [recipeSearch, setRecipeSearch] = useState('');
  const [restaurantOpen, setRestaurantOpen] = useState(false);
  const [recipeOpen, setRecipeOpen] = useState(false);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const [loadingRecipes, setLoadingRecipes] = useState(false);

  const searchRestaurants = async (query: string) => {
    if (!query.trim()) {
      setRestaurants([]);
      return;
    }

    setLoadingRestaurants(true);
    try {
      console.log('🔍 TagSelector: Buscando restaurantes:', query);
      
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name, location')
        .ilike('name', `%${query}%`)
        .limit(10);

      if (error) throw error;

      console.log('📍 TagSelector: Restaurantes encontrados:', data?.length || 0);
      setRestaurants(data || []);
    } catch (error) {
      console.error('❌ TagSelector: Error buscando restaurantes:', error);
      setRestaurants([]);
    } finally {
      setLoadingRestaurants(false);
    }
  };

  const searchRecipes = async (query: string) => {
    if (!query.trim()) {
      setRecipes([]);
      return;
    }

    setLoadingRecipes(true);
    try {
      console.log('🔍 TagSelector: Buscando recetas:', query);
      
      const { data, error } = await supabase
        .from('recipes')
        .select('id, title, author_id')
        .ilike('title', `%${query}%`)
        .eq('is_public', true)
        .limit(10);

      if (error) throw error;

      console.log('🍳 TagSelector: Recetas encontradas:', data?.length || 0);
      setRecipes(data || []);
    } catch (error) {
      console.error('❌ TagSelector: Error buscando recetas:', error);
      setRecipes([]);
    } finally {
      setLoadingRecipes(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchRestaurants(restaurantSearch);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [restaurantSearch]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchRecipes(recipeSearch);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [recipeSearch]);

  return (
    <div className="space-y-4">
      {/* Selector de Restaurante */}
      <div className="space-y-2">
        <Label>Etiquetar Restaurante (opcional)</Label>
        
        {selectedRestaurant ? (
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="flex items-center space-x-1">
              <MapPin className="h-3 w-3" />
              <span>{selectedRestaurant.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRestaurantSelect(null)}
                className="h-4 w-4 p-0 ml-1"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          </div>
        ) : (
          <Popover open={restaurantOpen} onOpenChange={setRestaurantOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
              >
                <Search className="h-4 w-4 mr-2" />
                Buscar restaurante...
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0">
              <Command>
                <CommandInput
                  placeholder="Buscar restaurante..."
                  value={restaurantSearch}
                  onValueChange={setRestaurantSearch}
                />
                <CommandList>
                  <CommandEmpty>
                    {loadingRestaurants ? 'Buscando...' : 'No se encontraron restaurantes'}
                  </CommandEmpty>
                  <CommandGroup>
                    {restaurants.map((restaurant) => (
                      <CommandItem
                        key={restaurant.id}
                        value={restaurant.name}
                        onSelect={() => {
                          onRestaurantSelect(restaurant);
                          setRestaurantOpen(false);
                          setRestaurantSearch('');
                        }}
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        <div>
                          <p className="font-medium">{restaurant.name}</p>
                          {restaurant.location && (
                            <p className="text-sm text-muted-foreground">{restaurant.location}</p>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Selector de Receta */}
      <div className="space-y-2">
        <Label>Etiquetar Receta (opcional)</Label>
        
        {selectedRecipe ? (
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="flex items-center space-x-1">
              <ChefHat className="h-3 w-3" />
              <span>{selectedRecipe.title}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRecipeSelect(null)}
                className="h-4 w-4 p-0 ml-1"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          </div>
        ) : (
          <Popover open={recipeOpen} onOpenChange={setRecipeOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
              >
                <Search className="h-4 w-4 mr-2" />
                Buscar receta...
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0">
              <Command>
                <CommandInput
                  placeholder="Buscar receta..."
                  value={recipeSearch}
                  onValueChange={setRecipeSearch}
                />
                <CommandList>
                  <CommandEmpty>
                    {loadingRecipes ? 'Buscando...' : 'No se encontraron recetas'}
                  </CommandEmpty>
                  <CommandGroup>
                    {recipes.map((recipe) => (
                      <CommandItem
                        key={recipe.id}
                        value={recipe.title}
                        onSelect={() => {
                          onRecipeSelect(recipe);
                          setRecipeOpen(false);
                          setRecipeSearch('');
                        }}
                      >
                        <ChefHat className="h-4 w-4 mr-2" />
                        <div>
                          <p className="font-medium">{recipe.title}</p>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
};
