
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import { Button } from '@/components/ui/button';
import { MarkAllRead, Bell } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { PageLayout } from '@/components/layout/PageLayout';

export default function Notifications() {
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAllAsRead, 
    isMarkingAllAsRead 
  } = useNotifications();

  if (isLoading) {
    return (
      <PageLayout title="Notificaciones">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-start space-x-3 p-4 bg-card rounded-lg">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Notificaciones">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold">Notificaciones</h1>
            {unreadCount > 0 && (
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
                {unreadCount} nuevas
              </span>
            )}
          </div>
          
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={() => markAllAsRead()}
              disabled={isMarkingAllAsRead}
            >
              <MarkAllRead className="h-4 w-4 mr-2" />
              Marcar todas como leídas
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No tienes notificaciones
              </h3>
              <p className="text-sm text-muted-foreground">
                Cuando tengas nuevas notificaciones, aparecerán aquí
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} className="bg-card rounded-lg">
                <NotificationItem notification={notification} />
              </div>
            ))
          )}
        </div>
      </div>
    </PageLayout>
  );
}
