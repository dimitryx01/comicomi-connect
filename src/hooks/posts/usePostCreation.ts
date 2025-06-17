
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
    recipeId?: string,
    mediaUrls?: { images?: string[]; videos?: string[] } | null,
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
      console.log('📝 usePostCreation: Creando nuevo post para usuario:', {
        userId: user.id,
        contentLength: content.length,
        location,
        restaurantId,
        recipeId,
        mediaUrls
      });

      // Validar que hay contenido
      if (!content.trim() && (!mediaUrls || ((!mediaUrls.images || mediaUrls.images.length === 0) && (!mediaUrls.videos || mediaUrls.videos.length === 0)))) {
        toast({
          title: "Error",
          description: "Debes agregar contenido o medios al post",
          variant: "destructive"
        });
        return false;
      }
      
      const postData = {
        content: content.trim(),
        author_id: user.id,
        location: location || null,
        restaurant_id: restaurantId || null,
        recipe_id: recipeId || null,
        media_urls: mediaUrls || null,
        post_type: 'general',
        is_public: true
      };

      console.log('💾 usePostCreation: Datos del post a insertar:', postData);

      const { error } = await supabase
        .from('posts')
        .insert(postData);

      if (error) {
        console.error('❌ usePostCreation: Error de base de datos:', error);
        throw error;
      }

      console.log('✅ usePostCreation: Post creado exitosamente');

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
      
      let errorMessage = "No se pudo publicar el post";
      if (error instanceof Error) {
        if (error.message.includes('duplicate')) {
          errorMessage = "Ya existe un post similar";
        } else if (error.message.includes('foreign key')) {
          errorMessage = "Referencia inválida de restaurante o receta";
        } else if (error.message.includes('check constraint')) {
          errorMessage = "Los datos del post no son válidos";
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast]);

  return { createPost };
};
