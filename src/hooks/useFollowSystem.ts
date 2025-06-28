
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useFollowSystem = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const followUser = useCallback(async (targetUserId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para seguir usuarios",
        variant: "destructive"
      });
      return false;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_follows')
        .insert({
          follower_id: user.id,
          followed_user_id: targetUserId
        });

      if (error) throw error;

      toast({
        title: "¡Seguido!",
        description: "Ahora sigues a este usuario"
      });
      
      return true;
    } catch (error) {
      console.error('Error following user:', error);
      toast({
        title: "Error",
        description: "No se pudo seguir al usuario",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const unfollowUser = useCallback(async (targetUserId: string) => {
    if (!user) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('followed_user_id', targetUserId);

      if (error) throw error;

      toast({
        title: "Dejaste de seguir",
        description: "Ya no sigues a este usuario"
      });
      
      return true;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      toast({
        title: "Error",
        description: "No se pudo dejar de seguir al usuario",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const followRestaurant = useCallback(async (restaurantId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para seguir restaurantes",
        variant: "destructive"
      });
      return false;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_follows')
        .insert({
          follower_id: user.id,
          followed_restaurant_id: restaurantId
        });

      if (error) throw error;

      toast({
        title: "¡Seguido!",
        description: "Ahora sigues a este restaurante"
      });
      
      return true;
    } catch (error) {
      console.error('Error following restaurant:', error);
      toast({
        title: "Error",
        description: "No se pudo seguir el restaurante",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const unfollowRestaurant = useCallback(async (restaurantId: string) => {
    if (!user) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('followed_restaurant_id', restaurantId);

      if (error) throw error;

      toast({
        title: "Dejaste de seguir",
        description: "Ya no sigues a este restaurante"
      });
      
      return true;
    } catch (error) {
      console.error('Error unfollowing restaurant:', error);
      toast({
        title: "Error",
        description: "No se pudo dejar de seguir el restaurante",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  return {
    followUser,
    unfollowUser,
    followRestaurant,
    unfollowRestaurant,
    loading
  };
};
