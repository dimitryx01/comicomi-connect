
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, X } from 'lucide-react';

interface RecipeFiltersProps {
  onFiltersChange: (filters: RecipeFilters) => void;
}

export interface RecipeFilters {
  search: string;
  difficulty: string[];
  cuisineType: string[];
  maxTime: number | null;
  sortBy: 'recent' | 'popular';
  ingredients: string[];
  interests: string[];
}

const RecipeFilters = ({ onFiltersChange }: RecipeFiltersProps) => {
  const [filters, setFilters] = useState<RecipeFilters>({
    search: '',
    difficulty: [],
    cuisineType: [],
    maxTime: null,
    sortBy: 'recent',
    ingredients: [],
    interests: []
  });

  const [newIngredient, setNewIngredient] = useState('');

  const difficulties = ['Fácil', 'Medio', 'Difícil'];
  const cuisineTypes = [
    'Asiática', 'Colombiana', 'Francesa', 'India', 'Italiana', 
    'Japonesa', 'Mediterránea', 'Mexicana', 'Española'
  ];

  const interestCategories = [
    'Vegano', 'Vegetariano', 'Sin gluten', 'Keto', 'Bajo en calorías',
    'Desayuno', 'Almuerzo', 'Cena', 'Postres', 'Snacks',
    'Fritura', 'Horneado', 'Parrilla', 'Salteado', 'Vapor'
  ];

  const updateFilters = (newFilters: Partial<RecipeFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const toggleArrayFilter = (key: keyof RecipeFilters, value: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    updateFilters({ [key]: newArray });
  };

  const addIngredient = () => {
    if (newIngredient.trim() && !filters.ingredients.includes(newIngredient.trim())) {
      updateFilters({ 
        ingredients: [...filters.ingredients, newIngredient.trim()] 
      });
      setNewIngredient('');
    }
  };

  const removeIngredient = (ingredient: string) => {
    updateFilters({
      ingredients: filters.ingredients.filter(i => i !== ingredient)
    });
  };

  const clearAllFilters = () => {
    const clearedFilters: RecipeFilters = {
      search: '',
      difficulty: [],
      cuisineType: [],
      maxTime: null,
      sortBy: 'recent',
      ingredients: [],
      interests: []
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = filters.search || 
    filters.difficulty.length > 0 || 
    filters.cuisineType.length > 0 || 
    filters.maxTime !== null || 
    filters.ingredients.length > 0 ||
    filters.interests.length > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filtros
        </CardTitle>
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={clearAllFilters}>
            <X className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Búsqueda */}
        <div>
          <Label htmlFor="search">Buscar recetas</Label>
          <Input
            id="search"
            placeholder="Buscar por título o descripción"
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
          />
        </div>

        {/* Ordenar por */}
        <div>
          <Label>Ordenar por</Label>
          <Select
            value={filters.sortBy}
            onValueChange={(value: 'recent' | 'popular') => updateFilters({ sortBy: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Más recientes</SelectItem>
              <SelectItem value="popular">Más populares</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tiempo máximo */}
        <div>
          <Label htmlFor="maxTime">Tiempo máximo (minutos)</Label>
          <Input
            id="maxTime"
            type="number"
            placeholder="Ej: 30"
            value={filters.maxTime || ''}
            onChange={(e) => updateFilters({ 
              maxTime: e.target.value ? parseInt(e.target.value) : null 
            })}
          />
        </div>

        {/* Dificultad */}
        <div>
          <Label>Dificultad</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {difficulties.map((difficulty) => (
              <Badge
                key={difficulty}
                variant={filters.difficulty.includes(difficulty) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleArrayFilter('difficulty', difficulty)}
              >
                {difficulty}
              </Badge>
            ))}
          </div>
        </div>

        {/* Tipo de cocina */}
        <div>
          <Label>Tipo de cocina</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {cuisineTypes.map((cuisine) => (
              <Badge
                key={cuisine}
                variant={filters.cuisineType.includes(cuisine) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleArrayFilter('cuisineType', cuisine)}
              >
                {cuisine}
              </Badge>
            ))}
          </div>
        </div>

        {/* Ingredientes */}
        <div>
          <Label>Ingredientes</Label>
          <div className="flex gap-2 mt-2">
            <Input
              placeholder="Agregar ingrediente"
              value={newIngredient}
              onChange={(e) => setNewIngredient(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
            />
            <Button type="button" onClick={addIngredient} size="sm">
              Agregar
            </Button>
          </div>
          {filters.ingredients.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {filters.ingredients.map((ingredient) => (
                <Badge
                  key={ingredient}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => removeIngredient(ingredient)}
                >
                  {ingredient}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Categorías de intereses */}
        <div>
          <Label>Categorías</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {interestCategories.map((interest) => (
              <Badge
                key={interest}
                variant={filters.interests.includes(interest) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleArrayFilter('interests', interest)}
              >
                {interest}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecipeFilters;
