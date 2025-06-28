
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useRecipeActions = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const deleteRecipe = async (recipeId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para eliminar recetas",
        variant: "destructive"
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', recipeId)
        .eq('author_id', user.id); // Solo el autor puede eliminar

      if (error) throw error;

      toast({
        title: "Receta eliminada",
        description: "La receta ha sido eliminada exitosamente",
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la receta",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    deleteRecipe
  };
};
