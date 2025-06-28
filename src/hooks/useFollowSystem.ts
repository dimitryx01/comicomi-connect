
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
      // Verificar primero si ya está siguiendo para evitar duplicados
      const { data: existingFollow } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('followed_user_id', targetUserId)
        .maybeSingle();

      if (existingFollow) {
        console.log('🔄 followUser: Ya está siguiendo al usuario');
        toast({
          title: "Info",
          description: "Ya sigues a este usuario"
        });
        return true; // Retornar true porque técnicamente está siguiendo
      }

      const { error } = await supabase
        .from('user_follows')
        .insert({
          follower_id: user.id,
          followed_user_id: targetUserId
        });

      if (error) throw error;

      console.log('✅ followUser: Usuario seguido exitosamente');
      toast({
        title: "¡Seguido!",
        description: "Ahora sigues a este usuario"
      });
      
      return true;
    } catch (error) {
      console.error('❌ Error following user:', error);
      
      // Si el error es por duplicado, no mostrarlo como error
      if (error.code === '23505') {
        console.log('🔄 followUser: Duplicado detectado, ya está siguiendo');
        toast({
          title: "Info",
          description: "Ya sigues a este usuario"
        });
        return true;
      }
      
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

      console.log('✅ unfollowUser: Usuario no seguido exitosamente');
      toast({
        title: "Dejaste de seguir",
        description: "Ya no sigues a este usuario"
      });
      
      return true;
    } catch (error) {
      console.error('❌ Error unfollowing user:', error);
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
      // Verificar primero si ya está siguiendo para evitar duplicados
      const { data: existingFollow } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('followed_restaurant_id', restaurantId)
        .maybeSingle();

      if (existingFollow) {
        console.log('🔄 followRestaurant: Ya está siguiendo al restaurante');
        toast({
          title: "Info",
          description: "Ya sigues a este restaurante"
        });
        return true; // Retornar true porque técnicamente está siguiendo
      }

      const { error } = await supabase
        .from('user_follows')
        .insert({
          follower_id: user.id,
          followed_restaurant_id: restaurantId
        });

      if (error) throw error;

      console.log('✅ followRestaurant: Restaurante seguido exitosamente');
      toast({
        title: "¡Seguido!",
        description: "Ahora sigues a este restaurante"
      });
      
      return true;
    } catch (error) {
      console.error('❌ Error following restaurant:', error);
      
      // Si el error es por duplicado, no mostrarlo como error
      if (error.code === '23505') {
        console.log('🔄 followRestaurant: Duplicado detectado, ya está siguiendo');
        toast({
          title: "Info",
          description: "Ya sigues a este restaurante"
        });
        return true;
      }
      
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

      console.log('✅ unfollowRestaurant: Restaurante no seguido exitosamente');
      toast({
        title: "Dejaste de seguir",
        description: "Ya no sigues a este restaurante"
      });
      
      return true;
    } catch (error) {
      console.error('❌ Error unfollowing restaurant:', error);
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
