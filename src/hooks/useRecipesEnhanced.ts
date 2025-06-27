
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Recipe {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  youtube_url: string | null;
  author_id: string | null;
  author_name: string | null;
  author_username: string | null;
  author_avatar_url: string | null;
  prep_time: number | null;
  cook_time: number | null;
  total_time: number | null;
  servings: number | null;
  cuisine_type: string | null;
  difficulty: string | null;
  ingredients: any;
  steps: any;
  allergens: string[] | null;
  tags: string[] | null;
  recipe_interests: string[] | null;
  created_at: string;
  cheers_count: number;
  saves_count: number;
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

export const useRecipesEnhanced = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<RecipeFilters>({
    search: '',
    difficulty: [],
    cuisineType: [],
    maxTime: null,
    sortBy: 'recent',
    ingredients: [],
    interests: []
  });

  const fetchRecipes = async (appliedFilters: RecipeFilters = filters) => {
    try {
      console.log('🔍 Fetching recipes with filters:', appliedFilters);
      setLoading(true);

      // Usar la función SQL que ya incluye toda la información del autor
      let query = supabase.rpc('get_recipes_with_author_info');

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching recipes:', error);
        toast.error('Error al cargar las recetas');
        return;
      }

      console.log('✅ Raw recipes data:', data);

      let filteredRecipes = data || [];

      // Aplicar filtros localmente
      if (appliedFilters.search) {
        const searchLower = appliedFilters.search.toLowerCase();
        filteredRecipes = filteredRecipes.filter(recipe => 
          recipe.title.toLowerCase().includes(searchLower) ||
          (recipe.description && recipe.description.toLowerCase().includes(searchLower)) ||
          (recipe.tags && recipe.tags.some(tag => tag.toLowerCase().includes(searchLower)))
        );
      }

      if (appliedFilters.cuisineType && appliedFilters.cuisineType.length > 0) {
        filteredRecipes = filteredRecipes.filter(recipe => 
          recipe.cuisine_type && appliedFilters.cuisineType.includes(recipe.cuisine_type)
        );
      }

      if (appliedFilters.difficulty && appliedFilters.difficulty.length > 0) {
        filteredRecipes = filteredRecipes.filter(recipe => 
          recipe.difficulty && appliedFilters.difficulty.includes(recipe.difficulty)
        );
      }

      if (appliedFilters.maxTime) {
        filteredRecipes = filteredRecipes.filter(recipe => 
          recipe.total_time && recipe.total_time <= appliedFilters.maxTime!
        );
      }

      if (appliedFilters.interests && appliedFilters.interests.length > 0) {
        filteredRecipes = filteredRecipes.filter(recipe => 
          recipe.recipe_interests && 
          appliedFilters.interests.some(interest => 
            recipe.recipe_interests!.includes(interest)
          )
        );
      }

      if (appliedFilters.ingredients && appliedFilters.ingredients.length > 0) {
        filteredRecipes = filteredRecipes.filter(recipe => 
          appliedFilters.ingredients.every(ingredient => {
            if (!recipe.ingredients) return false;
            const ingredientsList = Array.isArray(recipe.ingredients) 
              ? recipe.ingredients 
              : Object.values(recipe.ingredients);
            return ingredientsList.some((recipeIngredient: any) => 
              recipeIngredient.name?.toLowerCase().includes(ingredient.toLowerCase())
            );
          })
        );
      }

      // Aplicar ordenamiento
      if (appliedFilters.sortBy === 'popular') {
        filteredRecipes.sort((a, b) => (b.cheers_count + b.saves_count) - (a.cheers_count + a.saves_count));
      } else {
        filteredRecipes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }

      console.log('✅ Filtered recipes:', {
        total: filteredRecipes.length,
        sample: filteredRecipes.slice(0, 2).map(r => ({
          id: r.id,
          title: r.title,
          author_name: r.author_name,
          author_username: r.author_username,
          author_avatar_url: r.author_avatar_url
        }))
      });

      setRecipes(filteredRecipes);
    } catch (error) {
      console.error('💥 Error in fetchRecipes:', error);
      toast.error('Error inesperado al cargar las recetas');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (newFilters: RecipeFilters) => {
    console.log('🎯 Applying filters:', newFilters);
    setFilters(newFilters);
    fetchRecipes(newFilters);
  };

  const refreshRecipes = () => {
    console.log('🔄 Refreshing recipes...');
    fetchRecipes(filters);
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  return {
    recipes,
    loading,
    applyFilters,
    refreshRecipes
  };
};
