
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface SharedPost {
  id: string;
  sharer_id: string;
  shared_type: 'post' | 'recipe' | 'restaurant';
  shared_post_id?: string;
  shared_recipe_id?: string;
  shared_restaurant_id?: string;
  comment?: string;
  created_at: string;
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

  const shareContent = useCallback(async (
    type: 'post' | 'recipe' | 'restaurant',
    contentId: string,
    comment?: string
  ) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para compartir contenido",
        variant: "destructive"
      });
      return false;
    }

    setLoading(true);
    try {
      console.log('🔄 useSharedPosts: Compartiendo contenido:', { type, contentId, comment });

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

      const { error } = await supabase
        .from('shared_posts')
        .insert(shareData);

      if (error) {
        console.error('❌ useSharedPosts: Error compartiendo contenido:', error);
        throw error;
      }

      console.log('✅ useSharedPosts: Contenido compartido exitosamente');
      
      toast({
        title: "Contenido compartido",
        description: `Has compartido este ${type === 'post' ? 'post' : type === 'recipe' ? 'receta' : 'restaurante'} en tu perfil`,
      });

      return true;
    } catch (error) {
      console.error('❌ useSharedPosts: Error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo compartir el contenido",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const fetchSharedPosts = useCallback(async () => {
    setLoading(true);
    try {
      console.log('📡 useSharedPosts: Obteniendo publicaciones compartidas');

      const { data: sharedPosts, error } = await supabase
        .from('shared_posts')
        .select(`
          *,
          users!shared_posts_sharer_id_fkey(
            id,
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
            ...sharedPost,
            sharer: sharedPost.users,
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
    fetchSharedPosts,
    loading
  };
};
