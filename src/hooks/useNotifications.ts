import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  description: string;
  storeName?: string;
  storeId?: string;
  promotionId?: string;
  imageUrl?: string;
  receivedAt: string;
  read: boolean;
  notificationType: 'promotion' | 'achievement' | 'system';
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('received_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const transformed: Notification[] = (data || []).map((n: any) => ({
        id: n.id,
        userId: n.user_id,
        title: n.title,
        description: n.description,
        storeName: n.store_name,
        storeId: n.store_id,
        promotionId: n.promotion_id,
        imageUrl: n.image_url,
        receivedAt: n.received_at,
        read: n.read,
        notificationType: n.notification_type || 'promotion',
      }));

      setNotifications(transformed);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time subscription for new notifications
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification: Notification = {
            id: payload.new.id,
            userId: payload.new.user_id,
            title: payload.new.title,
            description: payload.new.description,
            storeName: payload.new.store_name,
            storeId: payload.new.store_id,
            promotionId: payload.new.promotion_id,
            imageUrl: payload.new.image_url,
            receivedAt: payload.new.received_at,
            read: payload.new.read,
            notificationType: payload.new.notification_type || 'promotion',
          };
          setNotifications((prev) => [newNotification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addNotification = async (notification: {
    title: string;
    description: string;
    storeName: string;
    storeId: string;
    promotionId: string;
    imageUrl?: string;
  }) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('notifications').insert({
        user_id: user.id,
        title: notification.title,
        description: notification.description,
        store_name: notification.storeName,
        store_id: notification.storeId,
        promotion_id: notification.promotionId,
        image_url: notification.imageUrl,
      });

      if (error) throw error;
      // Real-time will handle adding to state
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getUnreadCount = () => {
    return notifications.filter((n) => !n.read).length;
  };

  return {
    notifications,
    loading,
    addNotification,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    refetch: fetchNotifications,
  };
}
