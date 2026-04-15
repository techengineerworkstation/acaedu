'use client';

import { useEffect, createContext, useContext, useState } from 'react';
import { supabase } from './client';

interface UserType {
  id: string;
  email: string;
  full_name: string;
  role: string | null;
  department: string | null;
  avatar_url: string | null;
  [key: string]: any;
}

interface Session {
  user: { id: string; email: string } | null;
}

interface SessionContextType {
  session: Session | null;
  user: UserType | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

function buildUserFromAuth(authUser: any): UserType {
  return {
    id: authUser.id,
    email: authUser.email || '',
    full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
    role: authUser.user_metadata?.role || 'student',
    department: authUser.user_metadata?.department_id || null,
    avatar_url: authUser.user_metadata?.avatar_url || null,
  };
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [userDetails, setUserDetails] = useState<UserType | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const supabaseAny = supabase as any;
        const { data: { session: s } } = await supabaseAny.auth.getSession();
        setSession(s);
        
        if (s?.user) {
          let userFromAuth = buildUserFromAuth(s.user);
          
          // Try to get additional user data from user_profiles table
          try {
            const { data: profile } = await supabaseAny
              .from('user_profiles')
              .select('*')
              .eq('id', s.user.id)
              .single();
            
            if (profile) {
              userFromAuth = {
                ...userFromAuth,
                full_name: profile.full_name || userFromAuth.full_name,
                avatar_url: profile.avatar_url || userFromAuth.avatar_url,
                department: profile.department_id || profile.department_name || userFromAuth.department,
              };
            }
          } catch (profileError) {
            // Profile might not exist yet, use auth data only
          }
          
          setUserDetails(userFromAuth);
        }
      } catch (e) {
        console.error('Session error:', e);
      } finally {
        setIsLoading(false);
      }
    }

    checkSession();

    const supabaseAny = supabase as any;
    const { data: { subscription } } = supabaseAny.auth.onAuthStateChange(
      async (event: string, newSession: Session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setSession(newSession);
          if (newSession?.user) {
            const userFromAuth = buildUserFromAuth(newSession.user);
            setUserDetails(userFromAuth);
          }
        }
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUserDetails(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const supabaseAny = supabase as any;
    await supabaseAny.auth.signOut();
    setSession(null);
    setUserDetails(null);
    // Clear all auth cookies
    if (typeof document !== 'undefined') {
      document.cookie.split(';').forEach(c => {
        document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
      });
    }
  };

  return (
    <SessionContext.Provider value={{ session, user: userDetails, isLoading, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    return { session: null, user: null, isLoading: false, signOut: async () => {} };
  }
  return context;
}