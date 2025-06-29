
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Notification {
  id: string;
  type: string;
  related_entity_type: string | null;
  related_entity_id: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
  actor_id: string | null;
  actor_name: string | null;
  actor_username: string | null;
  actor_avatar: string | null;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('📧 useNotifications: No user ID, returning empty array');
        return [];
      }
      
      console.log('📧 useNotifications: Fetching notifications for user:', user.id);
      
      try {
        const { data, error } = await supabase.rpc('get_user_notifications', {
          target_user_id: user.id,
          page_limit: 50,
          page_offset: 0
        });

        if (error) {
          console.error('❌ useNotifications: Error fetching notifications:', error);
          throw error;
        }
        
        console.log('✅ useNotifications: Notifications fetched successfully:', data?.length || 0);
        return data || [];
      } catch (error) {
        console.error('❌ useNotifications: Exception in notifications fetch:', error);
        throw error;
      }
    },
    enabled: !!user?.id,
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications-unread-count', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('📧 useNotifications: No user ID for unread count');
        return 0;
      }
      
      console.log('📧 useNotifications: Fetching unread count for user:', user.id);
      
      try {
        const { data, error } = await supabase.rpc('get_unread_notifications_count', {
          target_user_id: user.id
        });

        if (error) {
          console.error('❌ useNotifications: Error fetching unread count:', error);
          throw error;
        }
        
        console.log('✅ useNotifications: Unread count fetched:', data || 0);
        return data || 0;
      } catch (error) {
        console.error('❌ useNotifications: Exception in unread count fetch:', error);
        throw error;
      }
    },
    enabled: !!user?.id,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      console.log('📧 useNotifications: Marking notification as read:', notificationId);
      
      try {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notificationId);

        if (error) {
          console.error('❌ useNotifications: Error marking as read:', error);
          throw error;
        }
        
        console.log('✅ useNotifications: Notification marked as read successfully');
      } catch (error) {
        console.error('❌ useNotifications: Exception marking as read:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('📧 useNotifications: Invalidating queries after mark as read');
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count', user?.id] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        console.log('📧 useNotifications: No user ID for mark all as read');
        return;
      }
      
      console.log('📧 useNotifications: Marking all notifications as read for user:', user.id);
      
      try {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', user.id)
          .eq('is_read', false);

        if (error) {
          console.error('❌ useNotifications: Error marking all as read:', error);
          throw error;
        }
        
        console.log('✅ useNotifications: All notifications marked as read successfully');
      } catch (error) {
        console.error('❌ useNotifications: Exception marking all as read:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('📧 useNotifications: Invalidating queries after mark all as read');
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count', user?.id] });
    },
  });

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
  };
};
