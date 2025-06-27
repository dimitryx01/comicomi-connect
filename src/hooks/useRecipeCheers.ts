
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useRecipeCheers = (recipeId: string) => {
  const { user } = useAuth();
  const [cheersCount, setCheersCount] = useState(0);
  const [hasCheered, setHasCheered] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch initial cheers count and user's cheer status
  useEffect(() => {
    if (!recipeId) return;

    const fetchCheersData = async () => {
      try {
        // Get total cheers count
        const { data: cheersData, error: cheersError } = await supabase
          .from('recipe_cheers')
          .select('id')
          .eq('recipe_id', recipeId);

        if (cheersError) {
          console.error('Error fetching recipe cheers:', cheersError);
          return;
        }

        setCheersCount(cheersData?.length || 0);

        // Check if current user has cheered (only if authenticated)
        if (user) {
          const { data: userCheerData, error: userCheerError } = await supabase
            .from('recipe_cheers')
            .select('id')
            .eq('recipe_id', recipeId)
            .eq('user_id', user.id)
            .maybeSingle();

          if (userCheerError) {
            console.error('Error checking user recipe cheer:', userCheerError);
            return;
          }

          setHasCheered(!!userCheerData);
        }
      } catch (error) {
        console.error('Error in fetchCheersData:', error);
      }
    };

    fetchCheersData();
  }, [recipeId, user]);

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
          .from('recipe_cheers')
          .delete()
          .eq('recipe_id', recipeId)
          .eq('user_id', user.id);

        if (error) throw error;

        setHasCheered(false);
        setCheersCount(prev => prev - 1);
      } else {
        // Add cheer
        const { error } = await supabase
          .from('recipe_cheers')
          .insert({
            recipe_id: recipeId,
            user_id: user.id
          });

        if (error) throw error;

        setHasCheered(true);
        setCheersCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling recipe cheer:', error);
      toast.error('Error al dar cheer');
    } finally {
      setLoading(false);
    }
  };

  return {
    cheersCount,
    hasCheered,
    toggleCheer,
    loading
  };
};
