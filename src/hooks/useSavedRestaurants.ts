import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logConfig';

export const useSavedRestaurants = () => {
  const [savedRestaurants, setSavedRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const fetchInProgressRef = useRef(false);

  // Memoize user ID to prevent unnecessary re-renders
  const userId = useMemo(() => user?.id, [user?.id]);

  const fetchSavedRestaurants = useCallback(async () => {
    if (!userId || fetchInProgressRef.current) {
      setSavedRestaurants([]);
      setLoading(false);
      return;
    }

    try {
      fetchInProgressRef.current = true;
      setLoading(true);
      logger.log('useSavedRestaurants', `Fetching saved restaurants for user ${userId}`);
      
      const { data, error } = await supabase
        .from('saved_restaurants')
        .select(`
          id,
          created_at,
          restaurant_id,
          restaurants!inner (
            id,
            name,
            description,
            image_url,
            cover_image_url,
            cuisine_type,
            location,
            address,
            phone,
            website,
            is_verified,
            created_at
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      logger.log('useSavedRestaurants', `Saved restaurants fetched: ${data?.length || 0}`);
      setSavedRestaurants(data || []);
    } catch (error) {
      logger.error('useSavedRestaurants', 'Error fetching saved restaurants', error);
      setSavedRestaurants([]);
    } finally {
      setLoading(false);
      fetchInProgressRef.current = false;
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchSavedRestaurants();
    } else {
      setSavedRestaurants([]);
    }
    
    return () => {
      // Cleanup
    };
  }, [userId, fetchSavedRestaurants]);

  const toggleSave = useCallback(async (restaurantId: string) => {
    if (!userId) return false;

    try {
      logger.log('useSavedRestaurants', `Toggling save for restaurant ${restaurantId}`);
      
      // Verificar si ya estu00e1 guardado
      const { data: existing, error: checkError } = await supabase
        .from('saved_restaurants')
        .select('id')
        .eq('user_id', userId)
        .eq('restaurant_id', restaurantId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;

      if (existing) {
        // Desguardar
        const { error: deleteError } = await supabase
          .from('saved_restaurants')
          .delete()
          .eq('user_id', userId)
          .eq('restaurant_id', restaurantId);

        if (deleteError) throw deleteError;

        logger.log('useSavedRestaurants', `Restaurant ${restaurantId} removed from saved`);
        toast({
          title: "Restaurante eliminado",
          description: "Restaurante eliminado de guardados",
        });
        
        // Update local state immediately
        setSavedRestaurants(prev => prev.filter(saved => saved.restaurant_id !== restaurantId));
        return false;
      } else {
        // Guardar
        const { error: insertError } = await supabase
          .from('saved_restaurants')
          .insert({
            user_id: userId,
            restaurant_id: restaurantId
          });

        if (insertError) throw insertError;

        logger.log('useSavedRestaurants', `Restaurant ${restaurantId} added to saved`);
        toast({
          title: "Restaurante guardado",
          description: "Restaurante agregado a guardados",
        });
        
        // Refresh to get the complete data
        fetchSavedRestaurants();
        return true;
      }
    } catch (error) {
      logger.error('useSavedRestaurants', `Error toggling save for restaurant ${restaurantId}`, error);
      toast({
        title: "Error",
        description: "No se pudo procesar la acciu00f3n",
        variant: "destructive"
      });
      return false;
    }
  }, [userId, toast, fetchSavedRestaurants]);

  const isSaved = useCallback((restaurantId: string) => {
    return savedRestaurants.some(saved => saved.restaurant_id === restaurantId);
  }, [savedRestaurants]);

  return {
    savedRestaurants,
    loading,
    toggleSave,
    isSaved,
    refreshSavedRestaurants: fetchSavedRestaurants
  };
};