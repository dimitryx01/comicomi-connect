import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useOptimizedUpload } from '@/hooks/useOptimizedUpload';
import { BatchUploadFile } from '@/utils/batchUpload';

export const usePostCreation = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { uploadMultipleFiles } = useOptimizedUpload();

  const createPost = useCallback(async (
    content: string, 
    location?: string, 
    restaurantId?: string,
    recipeId?: string,
    mediaFiles?: File[], // Cambiar de URLs a archivos
    onPostCreated?: (post: any) => void
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
      console.log('📝 usePostCreation: Creando nuevo post con optimización batch:', {
        userId: user.id,
        contentLength: content.length,
        location,
        restaurantId,
        recipeId,
        mediaFilesCount: mediaFiles?.length || 0
      });

      // Validar que hay contenido
      if (!content.trim() && (!mediaFiles || mediaFiles.length === 0)) {
        toast({
          title: "Error",
          description: "Debes agregar contenido o medios al post",
          variant: "destructive"
        });
        return false;
      }

      let mediaUrls: { images?: string[]; videos?: string[] } | null = null;

      // Subir archivos usando batch upload optimizado
      if (mediaFiles && mediaFiles.length > 0) {
        console.log('📦 usePostCreation: Procesando archivos con batch upload...');

        const batchFiles: BatchUploadFile[] = mediaFiles.map((file, index) => ({
          id: `post-media-${index}`,
          file,
          folder: 'posts',
          type: 'media'
        }));

        const batchResult = await uploadMultipleFiles(batchFiles);

        if (!batchResult.success || batchResult.successfulUploads === 0) {
          toast({
            title: "Error",
            description: "No se pudieron subir los archivos multimedia",
            variant: "destructive"
          });
          return false;
        }

        // Procesar resultados exitosos
        const uploadedFileIds = batchResult.results
          .filter(result => result.success && result.fileId)
          .map(result => result.fileId!);

        if (uploadedFileIds.length > 0) {
          mediaUrls = { images: uploadedFileIds };
          
          console.log('✅ usePostCreation: Archivos subidos con batch:', {
            totalFiles: mediaFiles.length,
            successfulUploads: batchResult.successfulUploads,
            skipped: batchResult.skippedFiles,
            transactionsSaved: batchResult.transactionsSaved
          });
        }
      }
      
      const postData = {
        content: content.trim(),
        author_id: user.id,
        location: location || null,
        restaurant_id: restaurantId || null,
        recipe_id: recipeId || null,
        media_urls: mediaUrls,
        post_type: 'general',
        is_public: true
      };

      console.log('💾 usePostCreation: Datos del post a insertar:', postData);

      const { data: insertedPost, error } = await supabase
        .from('posts')
        .insert(postData)
        .select(`
          *,
          users!posts_author_id_fkey(full_name, username, avatar_url),
          restaurants(name)
        `)
        .single();

      if (error) {
        console.error('❌ usePostCreation: Error de base de datos:', error);
        throw error;
      }

      console.log('✅ usePostCreation: Post creado exitosamente con optimización:', insertedPost);

      // Procesar el post con el formato esperado por el feed
      const processedPost = {
        id: insertedPost.id,
        content: insertedPost.content,
        created_at: insertedPost.created_at,
        author_id: insertedPost.author_id,
        author_name: insertedPost.users?.full_name || 'Usuario',
        author_username: insertedPost.users?.username || 'usuario',
        author_avatar: insertedPost.users?.avatar_url || '',
        media_urls: insertedPost.media_urls,
        location: insertedPost.location,
        restaurant_id: insertedPost.restaurant_id,
        restaurant_name: insertedPost.restaurants?.name || '',
        cheers_count: 0, // Nuevo post, sin cheers aún
        comments_count: 0 // Nuevo post, sin comentarios aún
      };

      // Llamar al callback con el post procesado para actualización optimista
      if (onPostCreated) {
        onPostCreated(processedPost);
      }

      toast({
        title: "¡Éxito!",
        description: "Post publicado correctamente con optimización de archivos",
      });

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
  }, [user, toast, uploadMultipleFiles]);

  return { createPost };
};
