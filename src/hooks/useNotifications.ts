import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';

export interface Notification {
  id: string;
  message: string;
  link: string;
  type: 'comment' | 'reply' | 'mention' | 'system' | 'new_post';
  is_read: boolean;
  created_at: string;
}

export const useNotifications = () => {
  const { session } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!session) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } else {
      setNotifications(data || []);
      const unread = (data || []).filter(n => !n.is_read).length;
      setUnreadCount(unread);
    }
    setLoading(false);
  }, [session]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAllAsRead = async () => {
    if (!session || unreadCount === 0) return;

    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', unreadIds);

    if (error) {
      console.error('Error marking notifications as read:', error);
    } else {
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    }
  };

  const clearAllNotifications = async () => {
    if (!session || notifications.length === 0) return false;

    // Deletar todas as notificações do usuário atual
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error clearing notifications:', error);
      return false;
    } else {
      // Limpar o estado local imediatamente
      setNotifications([]);
      setUnreadCount(0);
      return true;
    }
  };

  return { notifications, unreadCount, loading, markAllAsRead, clearAllNotifications, refresh: fetchNotifications };
};