
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSavedRecipes = () => {
  const [savedRecipes, setSavedRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchSavedRecipes();
    }
  }, [user]);

  const fetchSavedRecipes = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('🔍 useSavedRecipes: Obteniendo recetas guardadas');
      
      const { data, error } = await supabase
        .from('saved_recipes')
        .select(`
          id,
          created_at,
          recipe_id,
          recipes!inner (
            id,
            title,
            description,
            image_url,
            prep_time,
            cook_time,
            difficulty,
            cuisine_type,
            created_at,
            author_id,
            users!recipes_author_id_fkey (
              id,
              full_name,
              username,
              avatar_url
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSavedRecipes(data || []);
      console.log('✅ useSavedRecipes: Recetas guardadas obtenidas:', data?.length || 0);
    } catch (error) {
      console.error('❌ useSavedRecipes: Error obteniendo recetas guardadas:', error);
      setSavedRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = async (recipeId: string) => {
    if (!user) return false;

    try {
      console.log('🔄 useSavedRecipes: Alternando guardado de receta:', recipeId);
      
      // Verificar si ya está guardada
      const { data: existing, error: checkError } = await supabase
        .from('saved_recipes')
        .select('id')
        .eq('user_id', user.id)
        .eq('recipe_id', recipeId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;

      if (existing) {
        // Desguardar
        const { error: deleteError } = await supabase
          .from('saved_recipes')
          .delete()
          .eq('user_id', user.id)
          .eq('recipe_id', recipeId);

        if (deleteError) throw deleteError;

        toast({
          title: "Receta eliminada",
          description: "Receta eliminada de guardados",
        });
        
        await fetchSavedRecipes();
        return false;
      } else {
        // Guardar
        const { error: insertError } = await supabase
          .from('saved_recipes')
          .insert({
            user_id: user.id,
            recipe_id: recipeId
          });

        if (insertError) throw insertError;

        toast({
          title: "Receta guardada",
          description: "Receta agregada a guardados",
        });
        
        await fetchSavedRecipes();
        return true;
      }
    } catch (error) {
      console.error('❌ useSavedRecipes: Error al guardar/desguardar:', error);
      toast({
        title: "Error",
        description: "No se pudo procesar la acción",
        variant: "destructive"
      });
      return false;
    }
  };

  const isSaved = (recipeId: string) => {
    return savedRecipes.some(saved => saved.recipe_id === recipeId);
  };

  return {
    savedRecipes,
    loading,
    toggleSave,
    isSaved,
    refreshSavedRecipes: fetchSavedRecipes
  };
};
