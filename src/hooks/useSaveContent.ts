
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export type ContentType = 'post' | 'recipe' | 'restaurant' | 'shared_post';

interface SaveContentParams {
  contentId: string;
  contentType: ContentType;
  authorId?: string;
}

export const useSaveContent = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const checkIfSaved = useCallback(async (contentId: string, contentType: ContentType) => {
    if (!user) return false;

    try {
      let query;
      
      switch (contentType) {
        case 'post':
        case 'shared_post':
          query = supabase
            .from('saved_posts')
            .select('id')
            .eq('user_id', user.id)
            .eq('post_id', contentId);
          break;
        case 'recipe':
          query = supabase
            .from('saved_recipes')
            .select('id')
            .eq('user_id', user.id)
            .eq('recipe_id', contentId);
          break;
        case 'restaurant':
          query = supabase
            .from('saved_restaurants')
            .select('id')
            .eq('user_id', user.id)
            .eq('restaurant_id', contentId);
          break;
        default:
          return false;
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        console.error('Error checking if saved:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking if saved:', error);
      return false;
    }
  }, [user]);

  const saveContent = useCallback(async ({ contentId, contentType, authorId }: SaveContentParams) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para guardar contenido",
        variant: "destructive"
      });
      return false;
    }

    // Verificar que el usuario no sea el autor
    if (authorId && authorId === user.id) {
      toast({
        title: "No disponible",
        description: "No puedes guardar tu propio contenido",
        variant: "destructive"
      });
      return false;
    }

    try {
      setLoading(true);
      console.log('💾 useSaveContent: Guardando contenido:', { contentId, contentType });

      let insertQuery;
      
      switch (contentType) {
        case 'post':
        case 'shared_post':
          insertQuery = supabase
            .from('saved_posts')
            .insert({
              user_id: user.id,
              post_id: contentId
            });
          break;
        case 'recipe':
          insertQuery = supabase
            .from('saved_recipes')
            .insert({
              user_id: user.id,
              recipe_id: contentId
            });
          break;
        case 'restaurant':
          insertQuery = supabase
            .from('saved_restaurants')
            .insert({
              user_id: user.id,
              restaurant_id: contentId
            });
          break;
        default:
          throw new Error(`Unsupported content type: ${contentType}`);
      }

      const { error } = await insertQuery;

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Ya guardado",
            description: "Este contenido ya está en tus favoritos",
            variant: "destructive"
          });
          return false;
        }
        throw error;
      }

      console.log('✅ useSaveContent: Contenido guardado exitosamente');
      toast({
        title: "Guardado",
        description: "Contenido añadido a tus favoritos",
      });
      return true;
    } catch (error) {
      console.error('❌ useSaveContent: Error guardando contenido:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el contenido",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const unsaveContent = useCallback(async ({ contentId, contentType }: Omit<SaveContentParams, 'authorId'>) => {
    if (!user) return false;

    try {
      setLoading(true);
      console.log('🗑️ useSaveContent: Eliminando contenido de favoritos:', { contentId, contentType });

      let deleteQuery;
      
      switch (contentType) {
        case 'post':
        case 'shared_post':
          deleteQuery = supabase
            .from('saved_posts')
            .delete()
            .eq('user_id', user.id)
            .eq('post_id', contentId);
          break;
        case 'recipe':
          deleteQuery = supabase
            .from('saved_recipes')
            .delete()
            .eq('user_id', user.id)
            .eq('recipe_id', contentId);
          break;
        case 'restaurant':
          deleteQuery = supabase
            .from('saved_restaurants')
            .delete()
            .eq('user_id', user.id)
            .eq('restaurant_id', contentId);
          break;
        default:
          throw new Error(`Unsupported content type: ${contentType}`);
      }

      const { error } = await deleteQuery;

      if (error) throw error;

      console.log('✅ useSaveContent: Contenido eliminado de favoritos');
      toast({
        title: "Eliminado",
        description: "Contenido eliminado de tus favoritos",
      });
      return true;
    } catch (error) {
      console.error('❌ useSaveContent: Error eliminando contenido de favoritos:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar de favoritos",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  return {
    saveContent,
    unsaveContent,
    checkIfSaved,
    loading
  };
};
