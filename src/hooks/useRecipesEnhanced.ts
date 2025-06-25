
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RecipeFilters } from '@/components/recipe/RecipeFilters';

interface Recipe {
  id: string;
  title: string;
  description: string;
  image_url: string;
  youtube_url: string;
  author_id: string;
  author_name: string;
  author_username: string;
  author_avatar_url: string;
  prep_time: number;
  cook_time: number;
  total_time: number;
  servings: number;
  cuisine_type: string;
  difficulty: string;
  ingredients: any[];
  steps: any[];
  allergens: string[];
  tags: string[];
  recipe_interests: string[];
  created_at: string;
  cheers_count: number;
  saves_count: number;
}

export const useRecipesEnhanced = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.rpc('get_recipes_with_author_info');

      if (error) {
        console.error('Error fetching recipes:', error);
        setError('Error al cargar las recetas');
        return;
      }

      setRecipes(data || []);
      setFilteredRecipes(data || []);
    } catch (err) {
      console.error('Error:', err);
      setError('Error al cargar las recetas');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (filters: RecipeFilters) => {
    let filtered = [...recipes];

    // Filtro de búsqueda
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(recipe => 
        recipe.title.toLowerCase().includes(searchTerm) ||
        recipe.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Filtro de dificultad
    if (filters.difficulty.length > 0) {
      filtered = filtered.filter(recipe => 
        filters.difficulty.includes(recipe.difficulty)
      );
    }

    // Filtro de tipo de cocina
    if (filters.cuisineType.length > 0) {
      filtered = filtered.filter(recipe => 
        filters.cuisineType.includes(recipe.cuisine_type)
      );
    }

    // Filtro de tiempo máximo
    if (filters.maxTime !== null) {
      filtered = filtered.filter(recipe => 
        (recipe.total_time || (recipe.prep_time + recipe.cook_time)) <= filters.maxTime!
      );
    }

    // Filtro de ingredientes
    if (filters.ingredients.length > 0) {
      filtered = filtered.filter(recipe => 
        filters.ingredients.some(ingredient => 
          recipe.ingredients.some((recipeIng: any) => 
            recipeIng.name.toLowerCase().includes(ingredient.toLowerCase())
          )
        )
      );
    }

    // Filtro de intereses
    if (filters.interests.length > 0) {
      filtered = filtered.filter(recipe => 
        recipe.recipe_interests?.some(interest => 
          filters.interests.includes(interest)
        )
      );
    }

    // Ordenamiento
    if (filters.sortBy === 'popular') {
      filtered.sort((a, b) => b.cheers_count - a.cheers_count);
    } else {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    setFilteredRecipes(filtered);
  };

  const refreshRecipes = () => {
    fetchRecipes();
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  return {
    recipes: filteredRecipes,
    allRecipes: recipes,
    loading,
    error,
    applyFilters,
    refreshRecipes
  };
};
