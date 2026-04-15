import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types';

export function createAdminClient(): SupabaseClient<Database> & AuthMethods {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mpuhdybttdaxirinrcsp.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wdWhkeWJ0dGRheGlyaW5yY3NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNDUzNjQsImV4cCI6MjA5MDgyMTM2NH0.r5a0fJwurwyYaUbWxjJTK_-cBklbLLZIUv4WceEUCPM';

  return createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }) as SupabaseClient<Database> & AuthMethods;
}

interface AuthMethods {
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
      error?: any;
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
    signOut(): Promise<{ error: any }>;
    revokeRefreshToken(refresh_token: string): Promise<{ error: any }>;
    refreshSession(): Promise<{
      data: { session: any; user: any };
      error: any;
    }>;
    onAuthStateChange(callback: (event: string, session: any) => void): {
      data: { subscription: any };
    };
    verifyOtp(params: { token_hash: string; type: string; email?: string }): Promise<{
      data: { user: any; session: any };
      error: any;
    }>;
    admin: {
      createUser: (params: { email: string; password: string; email_confirm?: boolean; user_metadata?: Record<string, any> }) => Promise<{
        data: { user: any };
        error: any;
      }>;
      deleteUser: (userId: string) => Promise<{
        data: { user: any };
        error: any;
      }>;
    };
  };
}
