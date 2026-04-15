import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { Database } from './database.types';

export async function createClient(): Promise<SupabaseClient<Database> & AuthMethods> {
  const cookieStore = await cookies();

  const client = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component - ignore
          }
        },
      },
    }
  );

  return client as SupabaseClient<Database> & AuthMethods;
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
}
