
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { deleteMedia, deleteMultipleMedia } from '@/utils/mediaStorage';

export const usePostActions = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const deletePost = useCallback(async (
    postId: string, 
    authorId: string,
    onPostDeleted?: () => void
  ) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado",
        variant: "destructive"
      });
      return false;
    }

    if (user.id !== authorId) {
      toast({
        title: "Error",
        description: "Solo puedes eliminar tus propios posts",
        variant: "destructive"
      });
      return false;
    }

    try {
      console.log('🗑️ usePostActions: Iniciando eliminación completa del post:', postId);

      // 1. Primero obtener la información del post para acceder a las URLs de medios
      const { data: postData, error: fetchError } = await supabase
        .from('posts')
        .select('media_urls')
        .eq('id', postId)
        .eq('author_id', user.id)
        .single();

      if (fetchError) {
        console.error('❌ usePostActions: Error obteniendo datos del post:', fetchError);
        throw fetchError;
      }

      console.log('📋 usePostActions: Post obtenido, analizando medios:', postData?.media_urls);

      // 2. Actualización optimista: llamar callback inmediatamente
      if (onPostDeleted) {
        console.log('⚡ usePostActions: Ejecutando actualización optimista del feed...');
        onPostDeleted();
      }

      // 3. Eliminar archivos de Backblaze en segundo plano
      if (postData?.media_urls) {
        const mediaUrls = postData.media_urls as { images?: string[]; videos?: string[] };
        const allFileIds: string[] = [];

        // Recopilar todos los fileIds de imágenes y videos
        if (mediaUrls.images?.length) {
          allFileIds.push(...mediaUrls.images);
          console.log('📸 usePostActions: Imágenes a eliminar:', mediaUrls.images.length);
        }
        
        if (mediaUrls.videos?.length) {
          allFileIds.push(...mediaUrls.videos);
          console.log('🎥 usePostActions: Videos a eliminar:', mediaUrls.videos.length);
        }

        if (allFileIds.length > 0) {
          console.log('🔥 usePostActions: Eliminando archivos de Backblaze en segundo plano...');
          
          // Eliminar archivos en segundo plano sin bloquear la UI
          deleteMultipleMedia(allFileIds)
            .then((results) => {
              console.log('✅ usePostActions: Eliminación de archivos completada:', {
                eliminados: results.success.length,
                fallidos: results.failed.length
              });
              
              if (results.failed.length > 0) {
                console.warn('⚠️ usePostActions: Algunos archivos no pudieron eliminarse:', results.failed);
              }
            })
            .catch((error) => {
              console.error('❌ usePostActions: Error eliminando archivos de Backblaze:', error);
            });
        } else {
          console.log('ℹ️ usePostActions: No hay archivos multimedia para eliminar');
        }
      }

      // 4. Eliminar el post de la base de datos
      console.log('🗃️ usePostActions: Eliminando post de la base de datos...');
      const { error: deleteError } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('author_id', user.id); // Extra security check

      if (deleteError) {
        console.error('❌ usePostActions: Error eliminando post de DB:', deleteError);
        throw deleteError;
      }

      console.log('✅ usePostActions: Post eliminado exitosamente de la base de datos');
      
      toast({
        title: "Post eliminado",
        description: "El post y sus archivos se han eliminado correctamente",
      });
      
      return true;
    } catch (error) {
      console.error('❌ usePostActions: Error eliminando post:', error);
      
      // Si hubo un error, debemos revertir la actualización optimista
      // Esto se puede hacer refrescando el feed
      toast({
        title: "Error",
        description: "No se pudo eliminar el post. Actualiza la página e intenta de nuevo.",
        variant: "destructive"
      });
      
      return false;
    }
  }, [user, toast]);

  const reportPost = useCallback(async (postId: string, reportType: string = 'inappropriate_content') => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para reportar",
        variant: "destructive"
      });
      return false;
    }

    try {
      console.log('🚩 usePostActions: Reportando post:', postId);

      const { error } = await supabase
        .from('reports')
        .insert({
          reporter_id: user.id,
          post_id: postId,
          report_type: reportType,
          status: 'pending'
        });

      if (error) throw error;

      console.log('✅ usePostActions: Post reportado exitosamente');
      return true;
    } catch (error) {
      console.error('❌ usePostActions: Error reportando post:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar el reporte",
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast]);

  return {
    deletePost,
    reportPost
  };
};
