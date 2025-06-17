
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

export const useRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch recipes with manual joins
  const fetchRecipes = async () => {
    try {
      setLoading(true);
      
      // Get recipes with user info
      const { data: recipesData, error: recipesError } = await supabase
        .from('recipes')
        .select(`
          *,
          users!recipes_author_id_fkey(full_name)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (recipesError) throw recipesError;

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
          prep_time: recipe.prep_time,
          cook_time: recipe.cook_time,
          difficulty: recipe.difficulty,
          cuisine_type: recipe.cuisine_type,
          servings: recipe.servings,
          ingredients: recipe.ingredients,
          steps: recipe.steps,
          created_at: recipe.created_at,
          saves_count: savesCount || 0
        };
      }));

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

  // Set up real-time subscription
  useEffect(() => {
    fetchRecipes();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('recipes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'recipes'
        },
        () => {
          fetchRecipes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    recipes,
    loading,
    refreshRecipes: fetchRecipes
  };
};
