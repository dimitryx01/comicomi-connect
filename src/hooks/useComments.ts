
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user_full_name: string;
  user_username: string;
  user_avatar_url: string;
  cheers_count: number;
}

export const useComments = (postId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsCount, setCommentsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch comments
  const fetchComments = async () => {
    try {
      const { data, error } = await supabase.rpc('get_post_comments', {
        post_uuid: postId
      });

      if (error) throw error;
      setComments(data || []);
      setCommentsCount(data?.length || 0);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  // Fetch comments count
  const fetchCommentsCount = async () => {
    try {
      const { data, error } = await supabase.rpc('get_post_comments_count', {
        post_uuid: postId
      });

      if (error) throw error;
      setCommentsCount(data || 0);
    } catch (error) {
      console.error('Error fetching comments count:', error);
    }
  };

  // Add new comment
  const addComment = async (content: string) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "Debes estar autenticado para comentar",
          variant: "destructive"
        });
        return false;
      }

      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: content.trim()
        });

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Comentario agregado",
      });

      return true;
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar el comentario",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    fetchComments();
    fetchCommentsCount();

    // Subscribe to real-time changes
    const channel = supabase
      .channel(`comments-${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`
        },
        () => {
          fetchComments();
          fetchCommentsCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId]);

  return {
    comments,
    commentsCount,
    loading,
    addComment,
    refreshComments: fetchComments
  };
};
