import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@acadion/shared';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS_Mobile } from '../../constants';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

interface SupabaseContextType {
  supabase: SupabaseClient<Database> | null;
  isInitialized: boolean;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase, setSupabase] = useState<SupabaseClient<Database> | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeSupabase = async () => {
      try {
        const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
          auth: {
            storage: AsyncStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false
          }
        });
        setSupabase(client);
      } catch (error) {
        console.error('Supabase initialization error:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeSupabase();
  }, []);

  return (
    <SupabaseContext.Provider value={{ supabase, isInitialized }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within SupabaseProvider');
  }
  return context;
}
