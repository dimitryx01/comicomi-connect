
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import EnhancedCreateRecipeForm from './EnhancedCreateRecipeForm';

interface EditRecipeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  recipeId: string;
  onSuccess?: () => void;
}

interface RecipeData {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  youtube_url: string | null;
  prep_time: number | null;
  cook_time: number | null;
  servings: number | null;
  difficulty: string | null;
  cuisine_type: string | null;
  ingredients: any;
  steps: any;
  tags: string[] | null;
  allergens: string[] | null;
  recipe_interests: string[] | null;
}

export const EditRecipeDialog = ({ isOpen, onOpenChange, recipeId, onSuccess }: EditRecipeDialogProps) => {
  const [recipeData, setRecipeData] = useState<RecipeData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchRecipeData = async () => {
    if (!recipeId || !isOpen) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', recipeId)
        .single();

      if (error) {
        console.error('Error fetching recipe for edit:', error);
        toast.error('Error al cargar los datos de la receta');
        return;
      }

      setRecipeData(data);
    } catch (error) {
      console.error('Error in fetchRecipeData:', error);
      toast.error('Error al cargar los datos de la receta');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipeData();
  }, [recipeId, isOpen]);

  const handleSuccess = () => {
    setRecipeData(null);
    onOpenChange(false);
    onSuccess?.();
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Cargando...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <p>Cargando datos de la receta...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Editar Receta</DialogTitle>
        </DialogHeader>
        {recipeData && (
          <EnhancedCreateRecipeForm 
            onSuccess={handleSuccess}
            editMode={true}
            initialData={recipeData}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
