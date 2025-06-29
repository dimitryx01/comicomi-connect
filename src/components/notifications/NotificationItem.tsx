
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useNotifications, type Notification } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useUniversalImage } from '@/hooks/useUniversalImage';

interface NotificationItemProps {
  notification: Notification;
}

export const NotificationItem = ({ notification }: NotificationItemProps) => {
  const { markAsRead, deleteNotification } = useNotifications();
  const navigate = useNavigate();
  const { imageUrl: avatarUrl } = useUniversalImage(notification.actor_avatar);

  const handleClick = () => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    // Navegar al contenido relacionado
    if (notification.related_entity_type && notification.related_entity_id) {
      switch (notification.related_entity_type) {
        case 'post':
          navigate(`/post/${notification.related_entity_id}`);
          break;
        case 'recipe':
          navigate(`/recipe/${notification.related_entity_id}`);
          break;
        case 'user':
          navigate(`/profile/${notification.actor_username}`);
          break;
        case 'message':
          navigate('/messages');
          break;
        default:
          break;
      }
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification(notification.id);
  };

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'NEW_FOLLOWER':
        return '👤';
      case 'NEW_COMMENT':
      case 'NEW_RECIPE_COMMENT':
        return '💬';
      case 'POST_CHEER':
      case 'RECIPE_CHEER':
        return '🎉';
      case 'NEW_MESSAGE':
        return '💌';
      default:
        return '📢';
    }
  };

  return (
    <div
      className={cn(
        "flex items-start space-x-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors group",
        !notification.is_read && "bg-blue-50 dark:bg-blue-950/20"
      )}
      onClick={handleClick}
    >
      <div className="relative">
        <Avatar className="h-10 w-10">
          <AvatarImage src={avatarUrl} alt={notification.actor_name || ''} />
          <AvatarFallback>
            {notification.actor_name?.[0]?.toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-1 -right-1 text-xs bg-background rounded-full p-1">
          {getNotificationIcon()}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(notification.created_at), {
            addSuffix: true,
            locale: es,
          })}
        </p>
      </div>

      {!notification.is_read && (
        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
      )}

      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleDelete}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
