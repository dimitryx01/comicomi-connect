
import { NotificationItem } from './NotificationItem';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { CheckCheck, Loader2 } from 'lucide-react';

export const NotificationsList = () => {
  const { 
    notifications, 
    isLoading, 
    markAsRead, 
    markAllAsRead, 
    isMarkingAllAsRead,
    unreadCount 
  } = useNotifications();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        <p>No tienes notificaciones</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {unreadCount > 0 && (
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">
            Notificaciones ({unreadCount} sin leer)
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllAsRead()}
            disabled={isMarkingAllAsRead}
          >
            {isMarkingAllAsRead ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <CheckCheck className="w-4 h-4 mr-2" />
            )}
            Marcar todas como leídas
          </Button>
        </div>
      )}
      
      <div className="divide-y">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={markAsRead}
          />
        ))}
      </div>
    </div>
  );
};
