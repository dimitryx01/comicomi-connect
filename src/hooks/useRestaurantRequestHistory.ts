import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RestaurantRequestHistoryItem {
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
  dni_scan_url?: string;
  selfie_url?: string;
  ownership_proof_url?: string;
  requester?: {
    id: string;
    full_name?: string;
    username?: string;
    avatar_url?: string;
    email?: string;
  };
  restaurant?: {
    id: string;
    name?: string;
    address?: string;
    location?: string;
  };
  moderator?: {
    id: string;
    full_name?: string;
    email?: string;
  };
}

export const useRestaurantRequestHistory = (userId?: string, restaurantId?: string) => {
  return useQuery({
    queryKey: ['restaurant-request-history', userId, restaurantId],
    queryFn: async () => {
      if (!userId && !restaurantId) {
        return [];
      }

      // Build the query
      let requestQuery = supabase
        .from('restaurant_admin_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (userId && restaurantId) {
        requestQuery = requestQuery
          .eq('requester_user_id', userId)
          .eq('restaurant_id', restaurantId);
      } else if (userId) {
        requestQuery = requestQuery.eq('requester_user_id', userId);
      } else if (restaurantId) {
        requestQuery = requestQuery.eq('restaurant_id', restaurantId);
      }

      const { data: requestsData, error: requestsError } = await requestQuery;

      if (requestsError) {
        console.error('Error fetching request history:', requestsError);
        throw requestsError;
      }

      if (!requestsData || requestsData.length === 0) {
        return [];
      }

      // Get unique user, restaurant, and admin IDs
      const userIds = [...new Set(requestsData.map(r => r.requester_user_id))];
      const restaurantIds = [...new Set(requestsData.map(r => r.restaurant_id))];
      const adminIds = [...new Set(requestsData.map(r => r.moderated_by_admin_id).filter(Boolean))];

      // Fetch related data
      const [usersResponse, restaurantsResponse, adminsResponse] = await Promise.all([
        supabase
          .from('users')
          .select('id, full_name, username, avatar_url, email')
          .in('id', userIds),
        supabase
          .from('restaurants')
          .select('id, name, address, location')
          .in('id', restaurantIds),
        adminIds.length > 0 ? supabase
          .from('admin_users')
          .select('id, full_name, email')
          .in('id', adminIds) : Promise.resolve({ data: [] })
      ]);

      // Create lookup maps
      const usersMap = new Map(usersResponse.data?.map(user => [user.id, user] as [string, typeof user]) || []);
      const restaurantsMap = new Map(restaurantsResponse.data?.map(restaurant => [restaurant.id, restaurant] as [string, typeof restaurant]) || []);
      const adminsMap = new Map(adminsResponse.data?.map(admin => [admin.id, admin] as [string, typeof admin]) || []);

      // Enrich data
      const enrichedRequests = requestsData.map(request => ({
        ...request,
        requester: usersMap.get(request.requester_user_id),
        restaurant: restaurantsMap.get(request.restaurant_id),
        moderator: request.moderated_by_admin_id ? adminsMap.get(request.moderated_by_admin_id) : undefined,
      }));

      return enrichedRequests;
    },
    enabled: !!(userId || restaurantId),
  });
};

export const useUserRestaurantRequestHistory = (userId: string, restaurantId: string) => {
  return useRestaurantRequestHistory(userId, restaurantId);
};

export const useUserAllRequestsHistory = (userId: string) => {
  return useRestaurantRequestHistory(userId, undefined);
};

export const useRestaurantAllRequestsHistory = (restaurantId: string) => {
  return useRestaurantRequestHistory(undefined, restaurantId);
};