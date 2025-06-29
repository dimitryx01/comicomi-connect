
import { NotificationsList } from '@/components/notifications/NotificationsList';

const Notifications = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Notificaciones</h1>
      <NotificationsList />
    </div>
  );
};

export default Notifications;
