
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export interface Notification {
  id: string;
  type: string;
  related_entity_type?: string;
  related_entity_id?: string;
  message: string;
  is_read: boolean;
  created_at: string;
  actor_id?: string;
  actor_name?: string;
  actor_username?: string;
  actor_avatar?: string;
}

export const useNotifications = (page = 0, limit = 20) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Obtener notificaciones
  const { data: notifications, isLoading, error } = useQuery({
    queryKey: ['notifications', user?.id, page, limit],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase.rpc('get_user_notifications', {
        target_user_id: user.id,
        page_limit: limit,
        page_offset: page * limit
      });

      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!user?.id,
  });

  // Obtener contador de no leídas
  const { data: unreadCount } = useQuery({
    queryKey: ['notifications-unread-count', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      
      const { data, error } = await supabase.rpc('get_unread_notifications_count', {
        target_user_id: user.id
      });

      if (error) throw error;
      return data as number;
    },
    enabled: !!user?.id,
  });

  // Marcar notificación como leída
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  // Marcar todas como leídas
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  // Eliminar notificación
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  // Suscripción en tiempo real
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  return {
    notifications: notifications || [],
    unreadCount: unreadCount || 0,
    isLoading,
    error,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    isDeletingNotification: deleteNotificationMutation.isPending,
  };
};
