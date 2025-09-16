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
  const [canRequest, setCanRequest] = useState(false);
  const [needsSupport, setNeedsSupport] = useState(false);
  const [hasActiveAdmin, setHasActiveAdmin] = useState(false);
  const [revocationCount, setRevocationCount] = useState(0);

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
        .maybeSingle();

      setIsRestaurantAdmin(!!adminData);

      // Check if restaurant already has any active admin
      const { data: activeAdminData } = await supabase
        .from('restaurant_admins')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .limit(1);

      setHasActiveAdmin(!!activeAdminData && activeAdminData.length > 0);

      // Count revoked requests for this user and restaurant
      const { data: revokedRequests } = await supabase
        .from('restaurant_admin_requests')
        .select('id')
        .eq('restaurant_id', restaurantId)
        .eq('requester_user_id', user.id)
        .eq('status', 'revoked');

      const revokedCount = revokedRequests?.length || 0;
      setRevocationCount(revokedCount);

      // Fetch existing request (any status)
      const { data, error } = await supabase
        .from('restaurant_admin_requests')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('requester_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching request:', error);
        toast.error('Error al cargar la solicitud');
        return;
      }

      console.log('[DEBUG] Request data:', data);
      setRequest(data || null);

      // Determine request state
      const hasActiveAdmin = !!activeAdminData && activeAdminData.length > 0;
      const isUserAdmin = !!adminData;
      const needsSupportContact = revokedCount >= 2;
      const hasPendingRequest = data && data.status === 'pending';

      console.log('[DEBUG] Request state:', {
        hasActiveAdmin,
        isUserAdmin,
        needsSupportContact,
        hasPendingRequest,
        requestStatus: data?.status,
        revocationCount: revokedCount
      });

      setNeedsSupport(needsSupportContact);
      // Can request if: no active admin, not already admin, not needs support, and no pending request
      setCanRequest(!hasActiveAdmin && !isUserAdmin && !needsSupportContact && !hasPendingRequest);
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
    canRequest,
    needsSupport,
    hasActiveAdmin,
    revocationCount,
    refetch: fetchRequest,
    deletePendingRequest,
  };
};