
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSavedRestaurants = () => {
  const [savedRestaurants, setSavedRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSavedRestaurants = useCallback(async () => {
    if (!user) {
      setSavedRestaurants([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('🔍 useSavedRestaurants: Obteniendo restaurantes guardados para usuario:', user.id);
      
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
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSavedRestaurants(data || []);
      console.log('✅ useSavedRestaurants: Restaurantes guardados obtenidos:', data?.length || 0);
    } catch (error) {
      console.error('❌ useSavedRestaurants: Error obteniendo restaurantes guardados:', error);
      setSavedRestaurants([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchSavedRestaurants();
  }, [fetchSavedRestaurants]);

  const toggleSave = useCallback(async (restaurantId: string) => {
    if (!user) return false;

    try {
      console.log('🔄 useSavedRestaurants: Alternando guardado de restaurante:', restaurantId);
      
      // Verificar si ya está guardado
      const { data: existing, error: checkError } = await supabase
        .from('saved_restaurants')
        .select('id')
        .eq('user_id', user.id)
        .eq('restaurant_id', restaurantId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;

      if (existing) {
        // Desguardar
        const { error: deleteError } = await supabase
          .from('saved_restaurants')
          .delete()
          .eq('user_id', user.id)
          .eq('restaurant_id', restaurantId);

        if (deleteError) throw deleteError;

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
            user_id: user.id,
            restaurant_id: restaurantId
          });

        if (insertError) throw insertError;

        toast({
          title: "Restaurante guardado",
          description: "Restaurante agregado a guardados",
        });
        
        // Refresh to get the complete data
        fetchSavedRestaurants();
        return true;
      }
    } catch (error) {
      console.error('❌ useSavedRestaurants: Error al guardar/desguardar:', error);
      toast({
        title: "Error",
        description: "No se pudo procesar la acción",
        variant: "destructive"
      });
      return false;
    }
  }, [user?.id, toast, fetchSavedRestaurants]);

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
