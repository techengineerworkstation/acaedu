import { create } from 'zustand';
import { Notification } from '@acadion/shared';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
}

interface NotificationActions {
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  incrementUnread: () => void;
  resetUnread: () => void;
  refresh: () => Promise<void>;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false
};

export const useNotificationStore = create<NotificationState & NotificationActions>((set) => ({
  ...initialState,

  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter(n => !n.is_read).length
    }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1
    })),

  markAsRead: async (id: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/notifications/mark-read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_ids: [id] })
      });

      set((state) => ({
        notifications: state.notifications.map(n =>
          n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }));
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  },

  markAllAsRead: async () => {
    try {
      await fetch(`${API_BASE_URL}/api/notifications/mark-read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notification_ids: []
          // Empty array means all (backend would handle)
        })
      });

      set((state) => ({
        notifications: state.notifications.map(n => ({
          ...n,
          is_read: true,
          read_at: new Date().toISOString()
        })),
        unreadCount: 0
      }));
    } catch (error) {
      console.error('Mark all as read error:', error);
    }
  },

  incrementUnread: () =>
    set((state) => ({ unreadCount: state.unreadCount + 1 })),

  resetUnread: () =>
    set({ unreadCount: 0 }),

  refresh: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications?limit=50`);
      const data = await response.json();

      if (data.success) {
        set({
          notifications: data.data,
          unreadCount: data.data.filter((n: Notification) => !n.is_read).length,
          isLoading: false
        });
      }
    } catch (error) {
      console.error('Notifications fetch error:', error);
      set({ isLoading: false });
    }
  }
}));
