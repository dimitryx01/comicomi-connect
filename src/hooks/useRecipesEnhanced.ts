
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
  search?: string;
  cuisineType?: string;
  difficulty?: string;
  maxPrepTime?: number;
  interests?: string[];
  allergens?: string[];
}

export const useRecipesEnhanced = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<RecipeFilters>({});

  const fetchRecipes = async (appliedFilters: RecipeFilters = {}) => {
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

      if (appliedFilters.cuisineType) {
        filteredRecipes = filteredRecipes.filter(recipe => 
          recipe.cuisine_type === appliedFilters.cuisineType
        );
      }

      if (appliedFilters.difficulty) {
        filteredRecipes = filteredRecipes.filter(recipe => 
          recipe.difficulty === appliedFilters.difficulty
        );
      }

      if (appliedFilters.maxPrepTime) {
        filteredRecipes = filteredRecipes.filter(recipe => 
          recipe.total_time && recipe.total_time <= appliedFilters.maxPrepTime!
        );
      }

      if (appliedFilters.interests && appliedFilters.interests.length > 0) {
        filteredRecipes = filteredRecipes.filter(recipe => 
          recipe.recipe_interests && 
          appliedFilters.interests!.some(interest => 
            recipe.recipe_interests!.includes(interest)
          )
        );
      }

      if (appliedFilters.allergens && appliedFilters.allergens.length > 0) {
        filteredRecipes = filteredRecipes.filter(recipe => 
          !recipe.allergens || 
          !appliedFilters.allergens!.some(allergen => 
            recipe.allergens!.includes(allergen)
          )
        );
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
