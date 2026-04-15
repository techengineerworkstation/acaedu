import { api } from './client';
import { Notification } from '@acadion/shared';

export const notificationsApi = {
  /**
   * Get user's notifications
   */
  async getAll(params?: {
    page?: number;
    limit?: number;
    unread_only?: boolean;
  }): Promise<{
    success: boolean;
    data: Notification[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    };
    error?: string;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.unread_only) queryParams.append('unread_only', params.unread_only.toString());

    const queryString = queryParams.toString();
    return api.get<Notification[] & { pagination: any }>(
      `/api/notifications${queryString ? `?${queryString}` : ''}`
    );
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationIds: string[]): Promise<{ success: boolean; error?: string }> {
    return api.patch('/api/notifications/mark-read', {
      notification_ids: notificationIds
    });
  },

  /**
   * Mark all as read
   */
  async markAllAsRead(): Promise<{ success: boolean; error?: string }> {
    return api.patch('/api/notifications/mark-read', { notification_ids: [] });
  },

  /**
   * Broadcast notification (admin/lecturer only)
   */
  async broadcast(payload: {
    type: string;
    title: string;
    message: string;
    user_ids?: string[];
    target_role?: string;
    target_department?: string;
    data?: Record<string, any>;
  }): Promise<{ success: boolean; count: number; error?: string }> {
    return api.post<{ count: number }>('/api/notifications/broadcast', payload);
  }
};
