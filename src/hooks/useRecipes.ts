
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

  // Fetch recipes
  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_recipes_with_details');

      if (error) throw error;
      setRecipes(data || []);
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
