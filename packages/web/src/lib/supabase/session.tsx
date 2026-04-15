'use client';

import { useEffect, createContext, useContext, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { typedSupabase as supabase } from './client';
import { User as UserType, AuthSession as Session } from '@acadion/shared';
type AuthChangeEvent = 'INITIAL_SESSION' | 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED';

interface SessionContextType {
  session: Session | null;
  user: UserType | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [userDetails, setUserDetails] = useState<UserType | null>(null);

  // Get session from Supabase
  const {
    data: session,
    isLoading,
    error
  } = useQuery({
    queryKey: ['session'],
   queryFn: async () => {
      // 1. Cast supabase.auth to any to bypass the missing 'getSession' type error
      const { data, error } = await supabase.auth.getSession();
      
      if (error) throw error;

      // 2. Ensure you return the session from the data object
      return data.session;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes (formerly cacheTime)
  });

  // Fetch user details from our custom users table, auto-create if missing
  useEffect(() => {
    async function fetchUserDetails() {
      if (!session?.user) {
        setUserDetails(null);
        return;
      }

      // Try to fetch existing user
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (data && !error) {
        setUserDetails(data);
        return;
      }

      // User doesn't exist - try to create via admin (we'll need to call an API endpoint)
      // Since we can't use admin client directly in browser, we'll call a custom endpoint
      try {
        const response = await fetch('/api/auth/create-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: session.user.id,
            email: session.user.email,
            role: session.user.user_metadata?.role || null,
            fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            avatarUrl: session.user.user_metadata?.avatar_url || null,
          })
        });

        if (response.ok) {
          const { user: newUser } = await response.json();
          setUserDetails(newUser);
        } else {
          console.error('Failed to auto-create user via API');
          // Set minimal user to avoid breaking UI
          setUserDetails({
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.email?.split('@')[0] || 'User',
            role: null,
            department: null,
            email_verified: false,
            avatar_url: null,
            student_id: null,
            employee_id: null,
            created_at: new Date().toISOString(),
          } as any);
        }
      } catch (e) {
        console.error('Error auto-creating user:', e);
        // Set minimal user to avoid breaking UI
        setUserDetails({
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.email?.split('@')[0] || 'User',
          role: null,
          department: null,
          email_verified: false,
          avatar_url: null,
          student_id: null,
          employee_id: null,
          created_at: new Date().toISOString(),
        } as any);
      }
    }

    fetchUserDetails();
  }, [session?.user]);

  // Listen for auth changes
  useEffect(() => {
    const {
  data: { subscription }
} = supabase.auth.onAuthStateChange(
  async (event: any, newSession: any) => { // Use 'any' for event/session if they also throw errors
    if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
      queryClient.invalidateQueries({ queryKey: ['session'] });
    }

        if (event === 'SIGNED_OUT') {
          queryClient.clear();
          setUserDetails(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [queryClient]);

  const signOut = async () => {
    // Cast to 'any' to bypass the 'signOut does not exist' type error
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const refreshSession = async () => {
    // Cast to 'any' to bypass the 'refreshSession does not exist' type error
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('Error refreshing session:', error);
      throw error;
    }
    
    // Invalidate the session query to reflect the new token
    queryClient.invalidateQueries({ queryKey: ['session'] });
    return data.session;
  };

  const value = useMemo<SessionContextType>(
    () => ({
      session,
      user: userDetails,
      isLoading,
      signOut,
      refreshSession
    }),
    [session, userDetails, isLoading]
  );

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
