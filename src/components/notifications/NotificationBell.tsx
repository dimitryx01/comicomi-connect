
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

export const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const recentNotifications = notifications.slice(0, 5);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
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
                  onMarkAsRead={markAsRead}
                />
              ))}
            </div>
            
            {notifications.length > 5 && (
              <div className="p-4 border-t">
                <Link to="/notifications">
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
