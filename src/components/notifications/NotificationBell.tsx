
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationItem } from './NotificationItem';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [showBadge, setShowBadge] = useState(true);
  const recentNotifications = notifications.slice(0, 5);

  const handleNotificationClick = (notificationId: string) => {
    console.log('🔔 NotificationBell: Notification clicked, closing panel:', notificationId);
    markAsRead(notificationId);
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    console.log('🔔 NotificationBell: Panel open state changed:', open);
    setIsOpen(open);
    
    // Ocultar badge cuando se abre el panel
    if (open) {
      setShowBadge(false);
    }
  };

  // Mostrar badge solo si hay notificaciones no leídas Y showBadge es true
  const shouldShowBadge = unreadCount > 0 && showBadge && !isOpen;

  // Resetear showBadge cuando llegan nuevas notificaciones no leídas
  useState(() => {
    if (unreadCount > 0 && !isOpen) {
      setShowBadge(true);
    }
  }, [unreadCount, isOpen]);

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {shouldShowBadge && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Notificaciones</h3>
        </div>
        
        {recentNotifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No tienes notificaciones
          </div>
        ) : (
          <>
            <div className="divide-y max-h-80 overflow-y-auto">
              {recentNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleNotificationClick}
                />
              ))}
            </div>
            
            {notifications.length > 5 && (
              <div className="p-4 border-t">
                <Link to="/notifications" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Ver todas las notificaciones
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};
