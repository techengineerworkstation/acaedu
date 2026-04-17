import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mpuhdybttdaxirinrcsp.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wdWhkeWJ0dGRheGlyaW5yY3NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNDUzNjQsImV4cCI6MjA5MDgyMTM2NH0.r5a0fJwurwyYaUbWxjJTK_-cBklbLLZIUv4WceEUCPM';

// Storage adapter for Expo SecureStore
const SecureStoreAdapter = {
  getItem: async (key: string) => {
    return await SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string) => {
    await SecureStore.deleteItemAsync(key);
  },
};

let supabase: SupabaseClient;

export async function initSupabase() {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: SecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });

  return supabase;
}

export function getSupabase() {
  if (!supabase) {
    throw new Error('Supabase not initialized. Call initSupabase() first.');
  }
  return supabase;
}

// Helper to get current user with profile
export async function getCurrentUser() {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // Fetch user profile from custom users table
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    return { ...user, profile };
  }

  return null;
}

// Auth methods
export async function signInWithEmail(email: string, password: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signUpWithEmail(email: string, password: string, metadata: any) {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });

  if (error) throw error;
  return data;
}

export async function signInWithGoogle() {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'yourapp://login-callback',
    },
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const supabase = getSupabase();
  await supabase.auth.signOut();
}

// Data fetching helpers
export async function fetchCourses(userRole: string, userId: string) {
  const supabase = getSupabase();
  let query = supabase
    .from('courses')
    .select(`
      *,
      department:departments (*),
      lecturer:users!courses_lecturer_id_fkey (*)
    `)
    .eq('is_active', true)
    .order('course_code', { ascending: true });

  if (userRole === 'student') {
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('student_id', userId)
      .eq('status', 'active');

    const courseIds = enrollments?.map(e => e.course_id) || [];
    if (courseIds.length > 0) {
      query = query.in('id', courseIds);
    } else {
      return [];
    }
  } else if (userRole === 'lecturer') {
    query = query.eq('lecturer_id', userId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function fetchSchedules(userRole: string, userId: string, courseIds?: string[]) {
  const supabase = getSupabase();
  let query = supabase
    .from('schedules')
    .select(`
      *,
      course:courses (course_code, title)
    `)
    .order('start_time', { ascending: true });

  if (userRole === 'student' && courseIds) {
    query = query.in('course_id', courseIds);
  } else if (userRole === 'lecturer') {
    query = query.eq('lecturer_id', userId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function fetchNotifications(userId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data || [];
}

export async function fetchAnnouncements(userRole: string) {
  const supabase = getSupabase();
  let query = supabase
    .from('announcements')
    .select(`
      *,
      author:users (full_name)
    `)
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (userRole !== 'admin') {
    query = query.contains('target_roles', [userRole]);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export default {
  initSupabase,
  getSupabase,
  getCurrentUser,
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signOut,
  fetchCourses,
  fetchSchedules,
  fetchNotifications,
  fetchAnnouncements,
};