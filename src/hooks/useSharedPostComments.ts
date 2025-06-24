
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SharedPostComment } from '@/types/sharedPost';

export const useSharedPostComments = (sharedPostId: string) => {
  const [comments, setComments] = useState<SharedPostComment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [sharedPostId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      console.log('💬 useSharedPostComments: Obteniendo comentarios para shared post:', sharedPostId);
      
      const { data, error } = await supabase.rpc('get_shared_post_comments', {
        shared_post_uuid: sharedPostId
      });

      if (error) {
        console.error('❌ useSharedPostComments: Error obteniendo comentarios:', error);
        throw error;
      }
      
      console.log('📝 useSharedPostComments: Comentarios obtenidos:', data?.length || 0);
      setComments(data || []);
    } catch (error) {
      console.error('❌ useSharedPostComments: Error en fetchComments:', error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    comments,
    loading,
    refreshComments: fetchComments
  };
};
