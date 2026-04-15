import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/supabase/database.types';

declare global {
  interface Window {
    speechSynthesis: SpeechSynthesis;
  }
}

interface ExtendedAuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  token_type: string;
  user: {
    id: string;
    email?: string;
    user_metadata?: Record<string, any>;
  };
}

declare module '@supabase/supabase-js' {
  interface Auth {
    getSession(): Promise<{
      data: {
        session: ExtendedAuthSession | null;
      };
    }>;
    setSession(session: { access_token: string; refresh_token: string }): Promise<{
      data: { session: any; user: any };
      error: any;
    }>;
    getUser(): Promise<{
      data: { user: any };
      error: any;
    }>;
    exchangeCodeForSession(code: string): Promise<{
      data: { session: any; user: any };
      error: any;
    }>;
    signInWithPassword(credentials: { email: string; password: string }): Promise<{
      data: { session: any; user: any };
      error: any;
    }>;
    signUp(credentials: {
      email: string;
      password: string;
      options?: {
        data?: Record<string, any>;
        emailRedirectTo?: string;
      };
    }): Promise<{
      data: { session: any; user: any };
      error: any;
    }>;
    signOut(): Promise<{ error: any }>;
    revokeRefreshToken(refresh_token: string): Promise<{ error: any }>;
    refreshSession(): Promise<{
      data: { session: any; user: any };
      error: any;
    }>;
    onAuthStateChange(callback: (event: string, session: any) => void): {
      data: { subscription: any };
    };
    verifyOtp(params: {
      type: 'email_change' | 'invite' | 'recovery' | 'signup' | 'email';
      email: string;
      token: string;
    }): Promise<{
      data: { session: any; user: any };
      error: any;
    }>;
  }
}

export type TypedSupabaseClient = SupabaseClient<Database>;
export type { ExtendedAuthSession };

export {};
