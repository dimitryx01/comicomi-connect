
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Recipe {
  id: string;
  title: string;
  description: string;
  image_url: string;
  author_id: string;
  author_name: string;
  prep_time: number;
  cook_time: number;
  difficulty: string;
  cuisine_type: string;
  servings: number;
  ingredients: any;
  steps: any;
  created_at: string;
  saves_count: number;
}

export const useRecipesWithoutAuth = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      console.log('Fetching recipes from database...');
      
      // Get recipes with user info - sin filtro de autenticación
      const { data: recipesData, error: recipesError } = await supabase
        .from('recipes')
        .select(`
          *,
          users!recipes_author_id_fkey(full_name)
        `)
        .order('created_at', { ascending: false });

      if (recipesError) {
        console.error('Error fetching recipes:', recipesError);
        throw recipesError;
      }

      console.log('Recipes data received:', recipesData);

      // Get saves counts for each recipe
      const recipesWithCounts = await Promise.all((recipesData || []).map(async (recipe) => {
        // Get saves count
        const { count: savesCount } = await supabase
          .from('saved_recipes')
          .select('*', { count: 'exact', head: true })
          .eq('recipe_id', recipe.id);

        return {
          id: recipe.id,
          title: recipe.title,
          description: recipe.description,
          image_url: recipe.image_url,
          author_id: recipe.author_id,
          author_name: recipe.users?.full_name || 'Usuario',
          prep_time: recipe.prep_time || 0,
          cook_time: recipe.cook_time || 0,
          difficulty: recipe.difficulty,
          cuisine_type: recipe.cuisine_type,
          servings: recipe.servings,
          ingredients: recipe.ingredients,
          steps: recipe.steps,
          created_at: recipe.created_at,
          saves_count: savesCount || 0
        };
      }));

      console.log('Processed recipes:', recipesWithCounts);
      setRecipes(recipesWithCounts);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las recetas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  return {
    recipes,
    loading,
    refreshRecipes: fetchRecipes
  };
};
