import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useCommentCheers = (commentId: string) => {
  const { user } = useAuth();
  const [cheersCount, setCheersCount] = useState(0);
  const [hasCheered, setHasCheered] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch initial cheers data
  const fetchCheersData = useCallback(async () => {
    if (!commentId) return;

    try {
      // Get total cheers count
      const { data: cheersData, error: cheersError } = await supabase
        .from('comment_cheers')
        .select('id')
        .eq('comment_id', commentId);

      if (cheersError) {
        console.error('Error fetching comment cheers:', cheersError);
        return;
      }

      setCheersCount(cheersData?.length || 0);

      // Check if current user has cheered (only if authenticated)
      if (user?.id) {
        const { data: userCheerData, error: userCheerError } = await supabase
          .from('comment_cheers')
          .select('id')
          .eq('comment_id', commentId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (userCheerError) {
          console.error('Error checking user comment cheer:', userCheerError);
          return;
        }

        setHasCheered(!!userCheerData);
      } else {
        setHasCheered(false);
      }
    } catch (error) {
      console.error('Error in fetchCheersData:', error);
    }
  }, [commentId, user?.id]);

  useEffect(() => {
    fetchCheersData();
  }, [fetchCheersData]);

  const toggleCheer = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para dar cheers');
      return;
    }

    if (loading) return;

    setLoading(true);
    try {
      if (hasCheered) {
        // Remove cheer
        const { error } = await supabase
          .from('comment_cheers')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);

        if (error) throw error;

        setHasCheered(false);
        setCheersCount(prev => prev - 1);
      } else {
        // Add cheer
        const { error } = await supabase
          .from('comment_cheers')
          .insert({
            comment_id: commentId,
            user_id: user.id,
            comment_type: 'post_comment'
          });

        if (error) throw error;

        setHasCheered(true);
        setCheersCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling comment cheer:', error);
      toast.error('Error al dar cheer');
      
      // Revert optimistic update
      fetchCheersData();
    } finally {
      setLoading(false);
    }
  };

  return {
    cheersCount,
    hasCheered,
    toggleCheer,
    loading,
    refreshCheers: fetchCheersData
  };
};