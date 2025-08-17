import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RestaurantAdminRequest {
  id: string;
  restaurant_id: string;
  requester_user_id: string;
  full_name: string;
  legal_name: string;
  tax_id: string;
  email: string;
  phone: string;
  status: string;
  moderation_notes?: string;
  moderated_by_admin_id?: string;
  moderated_at?: string;
  created_at: string;
  updated_at: string;
}

export const useRestaurantAdminRequest = (restaurantId: string) => {
  const { user } = useAuth();
  const [request, setRequest] = useState<RestaurantAdminRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRestaurantAdmin, setIsRestaurantAdmin] = useState(false);

  const fetchRequest = async () => {
    if (!user || !restaurantId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Check if user is already a restaurant admin
      const { data: adminData } = await supabase
        .from('restaurant_admins')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('user_id', user.id)
        .single();

      setIsRestaurantAdmin(!!adminData);

      // Fetch existing request (any status)
      const { data, error } = await supabase
        .from('restaurant_admin_requests')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('requester_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching request:', error);
        toast.error('Error al cargar la solicitud');
        return;
      }

      setRequest(data || null);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const deletePendingRequest = async () => {
    if (!request || !user || request.status !== 'pending') {
      return false;
    }

    try {
      const { error } = await supabase
        .from('restaurant_admin_requests')
        .delete()
        .eq('id', request.id)
        .eq('requester_user_id', user.id)
        .eq('status', 'pending');

      if (error) {
        console.error('Error deleting request:', error);
        toast.error('Error al eliminar la solicitud');
        return false;
      }

      toast.success('Solicitud eliminada correctamente');
      setRequest(null);
      return true;
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar la solicitud');
      return false;
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [user, restaurantId]);

  return {
    request,
    loading,
    isRestaurantAdmin,
    refetch: fetchRequest,
    deletePendingRequest,
  };
};