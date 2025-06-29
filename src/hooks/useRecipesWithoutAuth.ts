
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Recipe {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  author_id: string;
  author_name?: string;
  author_username?: string;
  author_avatar_url?: string;
  prep_time?: number;
  cook_time?: number;
  difficulty?: string;
  cuisine_type?: string;
  created_at: string;
  saves_count?: number;
  cheers_count?: number;
}

export const useRecipesWithoutAuth = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        console.log('🔍 useRecipesWithoutAuth: Obteniendo recetas públicas con información del autor');
        
        const { data, error } = await supabase
          .from('recipes')
          .select(`
            id,
            title,
            description,
            image_url,
            author_id,
            prep_time,
            cook_time,
            difficulty,
            cuisine_type,
            created_at,
            users!recipes_author_id_fkey (
              id,
              full_name,
              username,
              avatar_url
            )
          `)
          .eq('is_public', true)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;

        // Transformar los datos para incluir información del autor
        const transformedRecipes: Recipe[] = (data || []).map(recipe => ({
          id: recipe.id,
          title: recipe.title,
          description: recipe.description,
          image_url: recipe.image_url,
          author_id: recipe.author_id,
          author_name: recipe.users?.full_name || 'Usuario',
          author_username: recipe.users?.username || recipe.users?.full_name || 'usuario',
          author_avatar_url: recipe.users?.avatar_url,
          prep_time: recipe.prep_time,
          cook_time: recipe.cook_time,
          difficulty: recipe.difficulty,
          cuisine_type: recipe.cuisine_type,
          created_at: recipe.created_at,
          saves_count: 0, // Por ahora en 0, se puede mejorar con una query más compleja
          cheers_count: 0 // Por ahora en 0, se puede mejorar con una query más compleja
        }));

        setRecipes(transformedRecipes);
        console.log('✅ useRecipesWithoutAuth: Recetas obtenidas:', transformedRecipes.length);
      } catch (err) {
        console.error('❌ useRecipesWithoutAuth: Error obteniendo recetas:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  return {
    recipes,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      setError(null);
    }
  };
};
