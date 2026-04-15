import { createBrowserClient } from '@supabase/ssr';
import { Database } from './database.types';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createBrowserClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        'x-application-name': 'acadion-web'
      }
    }
  }
);

export type TypedSupabaseClient = typeof supabase & {
  auth: {
    getSession(): Promise<{
      data: {
        session: {
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
        } | null;
      };
      error: any;
    }>;
    getUser(): Promise<{
      data: { user: any };
      error: any;
    }>;
    setSession(session: { access_token: string; refresh_token: string }): Promise<{
      data: { session: any; user: any };
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
    signInWithOtp(params: { email: string; options?: { emailRedirectTo?: string; data?: Record<string, any> } }): Promise<{
      data: { message: string };
      error: any;
    }>;
    signUp(credentials: { email: string; password: string; options?: { data?: Record<string, any>; emailRedirectTo?: string } }): Promise<{
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
  };
};

export const typedSupabase = supabase as TypedSupabaseClient;
