// Firebase App & Messaging (for FCM only - no auth)
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getMessaging, type Messaging } from 'firebase/messaging';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

let firebaseApp: FirebaseApp | null = null;
let messaging: Messaging | null = null;
let storage: FirebaseStorage | null = null;

if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApps()[0];
  }

  try {
    messaging = getMessaging(firebaseApp);
  } catch (e) {
    console.warn('Firebase Messaging initialization failed:', e);
    messaging = null;
  }

  try {
    storage = getStorage(firebaseApp);
  } catch (e) {
    console.warn('Firebase Storage initialization failed:', e);
    storage = null;
  }
} else {
  console.warn('Firebase config incomplete. Messaging and Storage will not be available.');
}

// Supabase client for authentication
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Database, STORAGE_KEYS } from '@acadion/shared';

// Create Supabase client with React Native storage
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const supabase: SupabaseClient<Database> = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Sign in with Google OAuth
 * @param role - Optional role (for registration flow). If user doesn't exist, they will be created with this role.
 */
export async function signInWithGoogle(role?: string): Promise<{ user: any; session: any }> {
  const redirectTo = 'acadion://callback';

  const { data, error } = await supabase.auth.getOAuthSignInUrl({
    provider: 'google',
    options: { redirectTo },
  });

  if (error) {
    console.error('OAuth sign-in URL error:', error);
    throw error;
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url!, redirectTo);

  if (result.type !== 'success') {
    throw new Error('Authentication was cancelled');
  }

  const callbackUrl = new URL(result.url);
  const code = callbackUrl.searchParams.get('code');

  if (!code) {
    throw new Error('No authorization code received');
  }

  const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error('Code exchange error:', exchangeError);
    throw exchangeError;
  }

  const session = exchangeData.session;
  const userId = session.user.id;

  // Check if user exists in our custom users table
  const { data: existingUser } = await supabase.from('users').select('*').eq('id', userId).single();

  if (!existingUser) {
    if (!role) {
      throw new Error('User profile not found. Please register first.');
    }
    // Create new user record
    const fullName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User';
    const { error: insertError } = await supabase.from('users').insert({
      id: userId,
      email: session.user.email || '',
      full_name: fullName,
      role,
      department: null,
      email_verified: true,
      avatar_url: session.user.user_metadata?.avatar_url || null,
      student_id: null,
      employee_id: null,
    });

    if (insertError) {
      console.error('User creation error:', insertError);
      throw insertError;
    }
  }

  // Fetch the user record (with role, etc.)
  const { data: userRecord } = await supabase.from('users').select('*').eq('id', userId).single();

  if (!userRecord) {
    throw new Error('Failed to fetch user record');
  }

  // Store auth token and user for API client and store initialization
  try {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.AUTH_TOKEN, session.access_token],
      [STORAGE_KEYS.USER, JSON.stringify(userRecord)],
    ]);
  } catch (e) {
    console.error('Failed to store auth data:', e);
  }

  return { user: userRecord, session };
}

/**
 * Sign in with Apple OAuth
 */
export async function signInWithApple(role?: string): Promise<{ user: any; session: any }> {
  const redirectTo = 'acadion://callback';

  const { data, error } = await supabase.auth.getOAuthSignInUrl({
    provider: 'apple',
    options: { redirectTo },
  });

  if (error) {
    console.error('OAuth sign-in URL error:', error);
    throw error;
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url!, redirectTo);

  if (result.type !== 'success') {
    throw new Error('Authentication was cancelled');
  }

  const callbackUrl = new URL(result.url);
  const code = callbackUrl.searchParams.get('code');

  if (!code) {
    throw new Error('No authorization code received');
  }

  const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error('Code exchange error:', exchangeError);
    throw exchangeError;
  }

  const session = exchangeData.session;
  const userId = session.user.id;

  const { data: existingUser } = await supabase.from('users').select('*').eq('id', userId).single();

  if (!existingUser) {
    if (!role) {
      throw new Error('User profile not found. Please register first.');
    }
    const fullName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User';
    const { error: insertError } = await supabase.from('users').insert({
      id: userId,
      email: session.user.email || '',
      full_name: fullName,
      role,
      department: null,
      email_verified: true,
      avatar_url: session.user.user_metadata?.avatar_url || null,
      student_id: null,
      employee_id: null,
    });

    if (insertError) {
      console.error('User creation error:', insertError);
      throw insertError;
    }
  }

  const { data: userRecord } = await supabase.from('users').select('*').eq('id', userId).single();

  if (!userRecord) {
    throw new Error('Failed to fetch user record');
  }

  // Store auth token and user for API client and store initialization
  try {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.AUTH_TOKEN, session.access_token],
      [STORAGE_KEYS.USER, JSON.stringify(userRecord)],
    ]);
  } catch (e) {
    console.error('Failed to store auth data:', e);
  }

  return { user: userRecord, session };
}

/**
 * Sign out
 */
export async function signOutUser(): Promise<void> {
  try {
    await supabase.auth.signOut();
    // Clear stored auth data
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.USER,
    ]);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

/**
 * Get current Supabase session
 */
export async function getSession(): Promise<any> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/**
 * Get FCM token for push notifications
 */
export async function getFCMToken(): Promise<string | null> {
  if (!messaging) {
    console.warn('FCM not available');
    return null;
  }

  try {
    // In React Native, FCM token retrieval works differently
    // This is a placeholder; actual implementation depends on Firebase setup
    // You may need to use Notifications module from expo-notifications
    return null;
  } catch (error) {
    console.error('FCM token error:', error);
    return null;
  }
}

// Export Firebase messaging/storage for other uses if needed
export { messaging, storage };
