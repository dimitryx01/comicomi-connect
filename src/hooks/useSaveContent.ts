
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
      const tableName = getTableName(contentType);
      const columnName = getColumnName(contentType);
      
      const { data, error } = await supabase
        .from(tableName)
        .select('id')
        .eq('user_id', user.id)
        .eq(columnName, contentId)
        .maybeSingle();

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

      const tableName = getTableName(contentType);
      const columnName = getColumnName(contentType);
      
      const insertData = {
        user_id: user.id,
        [columnName]: contentId
      };

      const { error } = await supabase
        .from(tableName)
        .insert(insertData);

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

      const tableName = getTableName(contentType);
      const columnName = getColumnName(contentType);

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('user_id', user.id)
        .eq(columnName, contentId);

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

function getTableName(contentType: ContentType): string {
  switch (contentType) {
    case 'post':
    case 'shared_post':
      return 'saved_posts';
    case 'recipe':
      return 'saved_recipes';
    case 'restaurant':
      return 'saved_restaurants';
    default:
      throw new Error(`Unsupported content type: ${contentType}`);
  }
}

function getColumnName(contentType: ContentType): string {
  switch (contentType) {
    case 'post':
    case 'shared_post':
      return 'post_id';
    case 'recipe':
      return 'recipe_id';
    case 'restaurant':
      return 'restaurant_id';
    default:
      throw new Error(`Unsupported content type: ${contentType}`);
  }
}
