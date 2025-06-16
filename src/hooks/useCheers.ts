
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useCheers = (postId: string) => {
  const [cheersCount, setCheersCount] = useState(0);
  const [hasCheered, setHasCheered] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchCheersData();
  }, [postId, user]);

  const fetchCheersData = async () => {
    try {
      // Get cheers count using RPC function
      const { data: countData, error: countError } = await supabase.rpc('get_post_cheers_count', {
        post_uuid: postId
      });
      
      if (countError) throw countError;
      setCheersCount(countData || 0);

      // Check if current user has cheered this post
      if (user) {
        const { data: hasCheerData, error: hasCheerError } = await supabase.rpc('user_has_cheered_post', {
          post_uuid: postId,
          user_uuid: user.id
        });
        
        if (hasCheerError) throw hasCheerError;
        setHasCheered(hasCheerData || false);
      }
    } catch (error) {
      console.error('Error fetching cheers data:', error);
    }
  };

  const toggleCheer = async () => {
    if (!user || loading) return;

    setLoading(true);
    try {
      if (hasCheered) {
        // Remove cheer
        const { error } = await supabase
          .from('cheers')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;

        setCheersCount(prev => prev - 1);
        setHasCheered(false);
      } else {
        // Add cheer
        const { error } = await supabase
          .from('cheers')
          .insert({
            post_id: postId,
            user_id: user.id
          });

        if (error) throw error;

        setCheersCount(prev => prev + 1);
        setHasCheered(true);
      }
    } catch (error) {
      console.error('Error toggling cheer:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    cheersCount,
    hasCheered,
    loading,
    toggleCheer
  };
};
