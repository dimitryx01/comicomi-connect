
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface RecipeComment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user_full_name: string | null;
  user_username: string | null;
  user_avatar_url: string | null;
  cheers_count: number;
}

export const useRecipeComments = (recipeId: string) => {
  const [comments, setComments] = useState<RecipeComment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    if (!recipeId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_recipe_comments', {
        recipe_uuid: recipeId
      });

      if (error) {
        console.error('Error fetching recipe comments:', error);
        toast.error('Error al cargar comentarios');
        return;
      }

      setComments(data || []);
    } catch (error) {
      console.error('Error in fetchComments:', error);
      toast.error('Error al cargar comentarios');
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (content: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Debes iniciar sesión para comentar');
        return false;
      }

      const { error } = await supabase
        .from('recipe_comments')
        .insert({
          recipe_id: recipeId,
          user_id: user.id,
          content: content.trim()
        });

      if (error) {
        console.error('Error adding recipe comment:', error);
        toast.error('Error al agregar comentario');
        return false;
      }

      toast.success('Comentario agregado');
      await fetchComments(); // Refresh comments
      return true;
    } catch (error) {
      console.error('Error in addComment:', error);
      toast.error('Error al agregar comentario');
      return false;
    }
  };

  const refreshComments = () => {
    fetchComments();
  };

  useEffect(() => {
    fetchComments();
  }, [recipeId]);

  return {
    comments,
    loading,
    addComment,
    refreshComments
  };
};
