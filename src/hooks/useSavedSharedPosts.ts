
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSavedSharedPosts = () => {
  const [savedSharedPosts, setSavedSharedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchSavedSharedPosts();
    }
  }, [user]);

  const fetchSavedSharedPosts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('🔍 useSavedSharedPosts: Obteniendo posts compartidos guardados');
      
      const { data, error } = await supabase
        .from('saved_shared_posts')
        .select(`
          id,
          created_at,
          shared_post_id,
          shared_posts!inner (
            id,
            sharer_id,
            shared_type,
            shared_post_id,
            shared_recipe_id,
            shared_restaurant_id,
            comment,
            created_at,
            users!shared_posts_sharer_id_fkey (
              id,
              full_name,
              username,
              avatar_url
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSavedSharedPosts(data || []);
      console.log('✅ useSavedSharedPosts: Posts compartidos guardados obtenidos:', data?.length || 0);
    } catch (error) {
      console.error('❌ useSavedSharedPosts: Error obteniendo posts compartidos guardados:', error);
      setSavedSharedPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = async (sharedPostId: string) => {
    if (!user) return false;

    try {
      console.log('🔄 useSavedSharedPosts: Alternando guardado de post compartido:', sharedPostId);
      
      // Verificar si ya está guardado
      const { data: existing, error: checkError } = await supabase
        .from('saved_shared_posts')
        .select('id')
        .eq('user_id', user.id)
        .eq('shared_post_id', sharedPostId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;

      if (existing) {
        // Desguardar
        const { error: deleteError } = await supabase
          .from('saved_shared_posts')
          .delete()
          .eq('user_id', user.id)
          .eq('shared_post_id', sharedPostId);

        if (deleteError) throw deleteError;

        toast({
          title: "Post eliminado",
          description: "Post compartido eliminado de guardados",
        });
        
        await fetchSavedSharedPosts();
        return false;
      } else {
        // Guardar
        const { error: insertError } = await supabase
          .from('saved_shared_posts')
          .insert({
            user_id: user.id,
            shared_post_id: sharedPostId
          });

        if (insertError) throw insertError;

        toast({
          title: "Post guardado",
          description: "Post compartido agregado a guardados",
        });
        
        await fetchSavedSharedPosts();
        return true;
      }
    } catch (error) {
      console.error('❌ useSavedSharedPosts: Error al guardar/desguardar:', error);
      toast({
        title: "Error",
        description: "No se pudo procesar la acción",
        variant: "destructive"
      });
      return false;
    }
  };

  const isSaved = (sharedPostId: string) => {
    return savedSharedPosts.some(saved => saved.shared_post_id === sharedPostId);
  };

  return {
    savedSharedPosts,
    loading,
    toggleSave,
    isSaved,
    refreshSavedSharedPosts: fetchSavedSharedPosts
  };
};
