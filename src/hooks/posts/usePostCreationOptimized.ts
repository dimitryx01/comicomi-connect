
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useMediaUpload } from '@/hooks/useMediaUpload';

export const usePostCreationOptimized = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { uploadFile } = useMediaUpload();

  const createPost = useCallback(async (
    content: string,
    location?: string,
    restaurantId?: string,
    recipeId?: string,
    mediaFiles?: File[],
    onOptimisticUpdate?: (newPost: any) => void
  ) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para crear posts",
        variant: "destructive"
      });
      return false;
    }

    console.log('📝 usePostCreationOptimized: Creating post...', { 
      contentLength: content.length, 
      location, 
      restaurantId, 
      recipeId,
      mediaCount: mediaFiles?.length || 0
    });

    try {
      // Subir archivos de media si existen
      let mediaUrls: { images?: string[]; videos?: string[] } | undefined;
      
      if (mediaFiles && mediaFiles.length > 0) {
        console.log('📸 usePostCreationOptimized: Uploading media files...');
        const uploadPromises = mediaFiles.map(file => uploadFile(file, 'posts'));
        const uploadResults = await Promise.all(uploadPromises);
        
        const images: string[] = [];
        const videos: string[] = [];
        
        uploadResults.forEach((result, index) => {
          if (result.success && result.fileId) {
            const file = mediaFiles[index];
            if (file.type.startsWith('image/')) {
              images.push(result.fileId);
            } else if (file.type.startsWith('video/')) {
              videos.push(result.fileId);
            }
          }
        });
        
        if (images.length > 0 || videos.length > 0) {
          mediaUrls = {};
          if (images.length > 0) mediaUrls.images = images;
          if (videos.length > 0) mediaUrls.videos = videos;
        }
        
        console.log('✅ usePostCreationOptimized: Media uploaded:', mediaUrls);
      }

      // Crear el post en la base de datos
      const { data: newPost, error } = await supabase
        .from('posts')
        .insert({
          author_id: user.id,
          content,
          location,
          restaurant_id: restaurantId,
          recipe_id: recipeId,
          media_urls: mediaUrls,
          is_public: true
        })
        .select(`
          id, 
          author_id, 
          created_at, 
          content, 
          location, 
          restaurant_id, 
          recipe_id,
          media_urls,
          users!posts_author_id_fkey (
            full_name,
            username,
            avatar_url
          ),
          restaurants (
            name
          )
        `)
        .single();

      if (error) {
        console.error('❌ usePostCreationOptimized: Error creating post:', error);
        throw error;
      }

      console.log('✅ usePostCreationOptimized: Post created successfully:', newPost.id);

      // Crear objeto Post optimísticamente
      if (onOptimisticUpdate && newPost) {
        const optimisticPost = {
          id: newPost.id,
          author_id: newPost.author_id,
          created_at: newPost.created_at,
          content: newPost.content,
          location: newPost.location,
          restaurant_id: newPost.restaurant_id,
          recipe_id: newPost.recipe_id,
          media_urls: newPost.media_urls,
          cheers_count: 0,
          comments_count: 0,
          author_name: newPost.users?.full_name || user.user_metadata?.full_name || 'Usuario',
          author_username: newPost.users?.username || user.user_metadata?.username || 'usuario',
          author_avatar: newPost.users?.avatar_url || user.user_metadata?.avatar_url || '',
          restaurant_name: newPost.restaurants?.name || '',
          is_shared: false
        };

        console.log('⚡ usePostCreationOptimized: Calling optimistic update callback');
        onOptimisticUpdate(optimisticPost);
      }

      toast({
        title: "Post creado",
        description: "El post se ha publicado correctamente",
      });

      // Invalidar queries para refrescar el feed
      setTimeout(async () => {
        console.log('🔄 usePostCreationOptimized: Invalidating queries...');
        await queryClient.invalidateQueries({ queryKey: ['unified-feed'] });
        await queryClient.invalidateQueries({ queryKey: ['posts'] });
      }, 500);

      return true;
    } catch (error) {
      console.error('❌ usePostCreationOptimized: Error creating post:', error);
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo crear el post",
        variant: "destructive"
      });
      
      return false;
    }
  }, [user, toast, queryClient, uploadFile]);

  return { createPost };
};
