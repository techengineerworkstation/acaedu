import { api } from './client';
import { User, AuthSession } from '@acadion/shared';

export const authApi = {
  /**
   * Get current session
   */
  async getSession(): Promise<{
    success: boolean;
    session?: AuthSession;
    user?: User;
    error?: string;
  }> {
    return api.get<{ session: AuthSession; user: User }>('/api/auth/session');
  },

  /**
   * Sign out
   */
  async logout(): Promise<{ success: boolean; error?: string }> {
    return api.post('/api/auth/logout');
  }
};
