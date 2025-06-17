
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const usePostCreation = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const createPost = useCallback(async (
    content: string, 
    location?: string, 
    restaurantId?: string,
    onSuccess?: () => void
  ) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para publicar",
        variant: "destructive"
      });
      return false;
    }

    try {
      console.log('📝 usePostCreation: Creando nuevo post para usuario:', user.id);
      
      const { error } = await supabase
        .from('posts')
        .insert({
          content: content.trim(),
          author_id: user.id,
          location: location || null,
          restaurant_id: restaurantId || null,
          is_public: true
        });

      if (error) throw error;

      toast({
        title: "¡Éxito!",
        description: "Post publicado correctamente",
      });

      if (onSuccess) {
        onSuccess();
      }

      return true;
    } catch (error) {
      console.error('❌ usePostCreation: Error creating post:', error);
      toast({
        title: "Error",
        description: "No se pudo publicar el post",
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast]);

  return { createPost };
};
