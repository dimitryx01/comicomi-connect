
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Bell, Heart, MessageCircle, UserPlus, Mail } from 'lucide-react';
import { AvatarWithSignedUrl } from '@/components/ui/AvatarWithSignedUrl';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import type { Notification } from '@/hooks/useNotifications';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'NEW_FOLLOWER':
      return <UserPlus className="w-4 h-4 text-blue-500" />;
    case 'POST_CHEER':
    case 'RECIPE_CHEER':
      return <Heart className="w-4 h-4 text-red-500" />;
    case 'NEW_COMMENT':
    case 'NEW_RECIPE_COMMENT':
      return <MessageCircle className="w-4 h-4 text-green-500" />;
    case 'NEW_MESSAGE':
      return <Mail className="w-4 h-4 text-purple-500" />;
    default:
      return <Bell className="w-4 h-4 text-gray-500" />;
  }
};

const getNotificationLink = (notification: Notification) => {
  switch (notification.type) {
    case 'NEW_FOLLOWER':
      return `/profile/${notification.actor_username}`;
    case 'POST_CHEER':
    case 'NEW_COMMENT':
      return `/post/${notification.related_entity_id}`;
    case 'RECIPE_CHEER':
    case 'NEW_RECIPE_COMMENT':
      return `/recipes/${notification.related_entity_id}`;
    case 'NEW_MESSAGE':
      return `/messages`;
    default:
      return '#';
  }
};

export const NotificationItem = ({ notification, onMarkAsRead }: NotificationItemProps) => {
  const handleClick = (e: React.MouseEvent) => {
    console.log('🔔 NotificationItem: Click detected on notification:', notification.id);
    console.log('🔔 NotificationItem: onMarkAsRead function:', typeof onMarkAsRead);
    
    if (!notification.is_read) {
      console.log('🔔 NotificationItem: Marking as read and closing panel');
      onMarkAsRead(notification.id);
    } else {
      console.log('🔔 NotificationItem: Already read, just closing panel');
      onMarkAsRead(notification.id); // Still close the panel even if already read
    }
  };

  const link = getNotificationLink(notification);

  return (
    <Link
      to={link}
      onClick={handleClick}
      className={cn(
        "flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors",
        !notification.is_read && "bg-blue-50 border-l-4 border-blue-500"
      )}
    >
      <div className="flex-shrink-0">
        {notification.actor_avatar ? (
          <AvatarWithSignedUrl
            fileId={notification.actor_avatar}
            fallbackText={notification.actor_name || 'Usuario'}
            size="sm"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            {getNotificationIcon(notification.type)}
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">
          {notification.message}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {formatDistanceToNow(new Date(notification.created_at), {
            addSuffix: true,
            locale: es,
          })}
        </p>
      </div>
      
      {!notification.is_read && (
        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
      )}
    </Link>
  );
};
