import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthSession } from '@acadion/shared';

interface AuthState {
  user: User | null;
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setSession: (session: AuthSession | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

const initialState: AuthState = {
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      ...initialState,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false
        }),

      setSession: (session) =>
        set({
          session,
          isAuthenticated: !!session
        }),

      setLoading: (isLoading) =>
        set({ isLoading }),

      signOut: async () => {
        try {
          // Clear session on backend
          await fetch(`${API_BASE_URL}/api/auth/logout`, {
            method: 'POST',
            credentials: 'include'
          });

          // Clear storage
          await AsyncStorage.multiRemove([
            STORAGE_KEYS_Mobile.AUTH_TOKEN,
            STORAGE_KEYS_Mobile.USER
          ]);
        } catch (error) {
          console.error('Sign out error:', error);
        } finally {
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      },

      initialize: async () => {
        try {
          const token = await AsyncStorage.getItem(STORAGE_KEYS_Mobile.AUTH_TOKEN);
          const userStr = await AsyncStorage.getItem(STORAGE_KEYS_Mobile.USER);

          if (token && userStr) {
            const user = JSON.parse(userStr);
            set({
              user,
              session: { access_token: token } as AuthSession,
              isAuthenticated: true,
              isLoading: false
            });
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          console.error('Auth store init error:', error);
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'acadion-auth',
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
