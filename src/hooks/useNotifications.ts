import { useLocalStorage } from './useLocalStorage';
import { Notification } from '@/types/promotion';

const MAX_NOTIFICATIONS = 20;

export function useNotifications() {
  const [notifications, setNotifications] = useLocalStorage<Notification[]>('notifications', []);

  const addNotification = (notification: Omit<Notification, 'id' | 'receivedAt' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      receivedAt: new Date().toISOString(),
      read: false,
    };

    setNotifications((prev) => {
      const updated = [newNotification, ...prev];
      // Keep only the latest MAX_NOTIFICATIONS
      return updated.slice(0, MAX_NOTIFICATIONS);
    });
  };

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getUnreadCount = () => {
    return notifications.filter((n) => !n.read).length;
  };

  return {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
  };
}

