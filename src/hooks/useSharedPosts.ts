
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

export interface SharedPost {
  id: string;
  sharer_id: string;
  shared_type: 'post' | 'recipe' | 'restaurant';
  shared_post_id?: string;
  shared_recipe_id?: string;
  shared_restaurant_id?: string;
  comment?: string;
  created_at: string;
  updated_at: string;
  sharer: {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string;
  };
  original_content?: any;
}

export const useSharedPosts = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const shareContent = useCallback(async (
    type: 'post' | 'recipe' | 'restaurant',
    contentId: string,
    comment?: string
  ) => {
    if (!user) {
      console.error('❌ useSharedPosts: Usuario no autenticado al intentar compartir');
      toast({
        title: "Error",
        description: "Debes estar autenticado para compartir contenido",
        variant: "destructive"
      });
      return false;
    }

    setLoading(true);
    try {
      console.log('🔄 useSharedPosts: Iniciando compartir contenido:', { 
        type, 
        contentId, 
        comment, 
        userId: user.id 
      });

      const shareData: any = {
        sharer_id: user.id,
        shared_type: type,
        comment
      };

      // Establecer el ID correcto según el tipo
      if (type === 'post') {
        shareData.shared_post_id = contentId;
      } else if (type === 'recipe') {
        shareData.shared_recipe_id = contentId;
      } else if (type === 'restaurant') {
        shareData.shared_restaurant_id = contentId;
      }

      console.log('📤 useSharedPosts: Enviando datos a Supabase:', shareData);

      const { error, data } = await supabase
        .from('shared_posts')
        .insert(shareData)
        .select();

      if (error) {
        console.error('❌ useSharedPosts: Error de Supabase al compartir contenido:', error);
        throw error;
      }

      console.log('✅ useSharedPosts: Contenido compartido exitosamente:', data);
      
      toast({
        title: "Contenido compartido",
        description: `Has compartido este ${type === 'post' ? 'post' : type === 'recipe' ? 'receta' : 'restaurante'} en tu perfil`,
      });

      // Invalidar múltiples queries para refrescar todos los feeds
      console.log('🔄 useSharedPosts: Invalidando queries múltiples...');
      const queriesToInvalidate = [
        ['posts'],
        ['user-posts', user.id],
        ['profile-posts', user.id],
        ['shared-posts'],
        ['user-profile', user.id]
      ];

      await Promise.all(
        queriesToInvalidate.map(queryKey => 
          queryClient.invalidateQueries({ queryKey })
        )
      );
      
      console.log('✅ useSharedPosts: Todas las queries invalidadas correctamente');

      return true;
    } catch (error) {
      console.error('❌ useSharedPosts: Error completo:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo compartir el contenido",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast, queryClient]);

  const updateSharedPost = useCallback(async (sharedPostId: string, comment: string) => {
    if (!user) {
      console.error('❌ useSharedPosts: Usuario no autenticado al intentar actualizar');
      toast({
        title: "Error",
        description: "Debes estar autenticado para editar contenido",
        variant: "destructive"
      });
      return false;
    }

    setLoading(true);
    try {
      console.log('🔄 useSharedPosts: Iniciando actualización de publicación compartida:', { 
        sharedPostId, 
        comment,
        userId: user.id 
      });

      const updateData = { 
        comment, 
        updated_at: new Date().toISOString() 
      };

      console.log('📤 useSharedPosts: Enviando actualización a Supabase:', updateData);

      const { error, data } = await supabase
        .from('shared_posts')
        .update(updateData)
        .eq('id', sharedPostId)
        .eq('sharer_id', user.id) // Seguridad adicional
        .select();

      if (error) {
        console.error('❌ useSharedPosts: Error de Supabase al actualizar publicación compartida:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.error('❌ useSharedPosts: No se encontró la publicación compartida o no tienes permisos');
        throw new Error('No se encontró la publicación compartida o no tienes permisos para editarla');
      }

      console.log('✅ useSharedPosts: Publicación compartida actualizada exitosamente:', data);
      
      toast({
        title: "Publicación actualizada",
        description: "Tu publicación compartida ha sido actualizada correctamente",
      });

      // Invalidar queries para refrescar el contenido
      const queriesToInvalidate = [
        ['posts'],
        ['shared-posts'],
        ['user-posts', user.id],
        ['profile-posts', user.id]
      ];

      console.log('🔄 useSharedPosts: Invalidando queries tras actualización...');
      await Promise.all(
        queriesToInvalidate.map(queryKey => 
          queryClient.invalidateQueries({ queryKey })
        )
      );
      console.log('✅ useSharedPosts: Queries invalidadas tras actualización');

      return true;
    } catch (error) {
      console.error('❌ useSharedPosts: Error completo en actualización:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo actualizar la publicación",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast, queryClient]);

  const deleteSharedPost = useCallback(async (sharedPostId: string) => {
    if (!user) {
      console.error('❌ useSharedPosts: Usuario no autenticado al intentar eliminar');
      toast({
        title: "Error",
        description: "Debes estar autenticado para eliminar contenido",
        variant: "destructive"
      });
      return false;
    }

    setLoading(true);
    try {
      console.log('🔄 useSharedPosts: Iniciando eliminación de publicación compartida:', {
        sharedPostId,
        userId: user.id
      });

      const { error, data } = await supabase
        .from('shared_posts')
        .delete()
        .eq('id', sharedPostId)
        .eq('sharer_id', user.id) // Seguridad adicional
        .select();

      if (error) {
        console.error('❌ useSharedPosts: Error de Supabase al eliminar publicación compartida:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.error('❌ useSharedPosts: No se encontró la publicación compartida o no tienes permisos');
        throw new Error('No se encontró la publicación compartida o no tienes permisos para eliminarla');
      }

      console.log('✅ useSharedPosts: Publicación compartida eliminada exitosamente:', data);
      
      toast({
        title: "Publicación eliminada",
        description: "Tu publicación compartida ha sido eliminada correctamente",
      });

      // Invalidar queries para refrescar el contenido
      const queriesToInvalidate = [
        ['posts'],
        ['shared-posts'],
        ['user-posts', user.id],
        ['profile-posts', user.id]
      ];

      console.log('🔄 useSharedPosts: Invalidando queries tras eliminación...');
      await Promise.all(
        queriesToInvalidate.map(queryKey => 
          queryClient.invalidateQueries({ queryKey })
        )
      );
      console.log('✅ useSharedPosts: Queries invalidadas tras eliminación');

      return true;
    } catch (error) {
      console.error('❌ useSharedPosts: Error completo en eliminación:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar la publicación",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast, queryClient]);

  const fetchSharedPosts = useCallback(async () => {
    setLoading(true);
    try {
      console.log('📡 useSharedPosts: Obteniendo publicaciones compartidas');

      const { data: sharedPosts, error } = await supabase
        .from('shared_posts')
        .select(`
          id,
          sharer_id,
          shared_type,
          shared_post_id,
          shared_recipe_id,
          shared_restaurant_id,
          comment,
          created_at,
          users!shared_posts_sharer_id_fkey (
            full_name,
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ useSharedPosts: Error obteniendo publicaciones compartidas:', error);
        throw error;
      }

      // Obtener el contenido original para cada publicación compartida
      const postsWithContent = await Promise.all(
        (sharedPosts || []).map(async (sharedPost) => {
          let originalContent = null;

          try {
            // Obtener contenido original
            if (sharedPost.shared_type === 'post' && sharedPost.shared_post_id) {
              const { data } = await supabase
                .from('posts')
                .select(`
                  *,
                  users!posts_author_id_fkey(full_name, username, avatar_url),
                  restaurants(name)
                `)
                .eq('id', sharedPost.shared_post_id)
                .single();
              originalContent = data;
            } else if (sharedPost.shared_type === 'recipe' && sharedPost.shared_recipe_id) {
              const { data } = await supabase
                .from('recipes')
                .select(`
                  *,
                  users!recipes_author_id_fkey(full_name, username, avatar_url)
                `)
                .eq('id', sharedPost.shared_recipe_id)
                .single();
              originalContent = data;
            } else if (sharedPost.shared_type === 'restaurant' && sharedPost.shared_restaurant_id) {
              const { data } = await supabase
                .from('restaurants')
                .select('*')
                .eq('id', sharedPost.shared_restaurant_id)
                .single();
              originalContent = data;
            }
          } catch (error) {
            console.warn('⚠️ useSharedPosts: Error obteniendo contenido original:', error);
          }

          return {
            id: sharedPost.id,
            sharer_id: sharedPost.sharer_id,
            shared_type: sharedPost.shared_type,
            shared_post_id: sharedPost.shared_post_id,
            shared_recipe_id: sharedPost.shared_recipe_id,
            shared_restaurant_id: sharedPost.shared_restaurant_id,
            comment: sharedPost.comment,
            created_at: sharedPost.created_at,
            sharer: sharedPost.users || {
              id: sharedPost.sharer_id,
              full_name: 'Usuario desconocido',
              username: 'usuario',
              avatar_url: ''
            },
            original_content: originalContent
          } as SharedPost;
        })
      );

      console.log('✅ useSharedPosts: Publicaciones compartidas obtenidas:', postsWithContent.length);
      return postsWithContent;
    } catch (error) {
      console.error('❌ useSharedPosts: Error:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las publicaciones compartidas",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    shareContent,
    updateSharedPost,
    deleteSharedPost,
    fetchSharedPosts,
    loading
  };
};
