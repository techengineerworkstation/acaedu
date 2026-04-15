import admin from 'firebase-admin';

let adminInitialized = false;
let _authAdmin: admin.auth.Auth | null = null;
let _dbAdmin: admin.firestore.Firestore | null = null;

function ensureInitialized(): boolean {
  if (adminInitialized) return true;
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    console.error('Firebase Admin: FIREBASE_SERVICE_ACCOUNT_KEY is missing');
    return false;
  }
  try {
    const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    console.log('Firebase Admin: Parsing service account key (length:', serviceAccountStr.length, ')');
    const serviceAccount = JSON.parse(serviceAccountStr);
    console.log('Firebase Admin: Initializing with project:', serviceAccount.project_id);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    adminInitialized = true;
    _authAdmin = admin.auth();
    _dbAdmin = admin.firestore();
    console.log('Firebase Admin: Initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    if (error instanceof SyntaxError) {
      console.error('JSON Parse error - check FIREBASE_SERVICE_ACCOUNT_KEY format');
    }
    return false;
  }
}

export function getAuthAdmin(): admin.auth.Auth | null {
  if (!ensureInitialized()) {
    return null;
  }
  return _authAdmin!;
}

export function getDbAdmin(): admin.firestore.Firestore | null {
  if (!ensureInitialized()) {
    return null;
  }
  return _dbAdmin!;
}

// Backward compatible exports (but may be null if not initialized)
export const authAdmin = getAuthAdmin();
export const dbAdmin = getDbAdmin();

// Helper to verify Firebase ID token
export async function verifyFirebaseToken(token: string) {
  const auth = getAuthAdmin();
  if (!auth) {
    console.warn('Firebase Admin not initialized - skipping token verification');
    return null;
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    return null;
  }
}

// Helper to set custom claims (role, department_id)
export async function setUserCustomClaims(
  uid: string,
  claims: { role?: string; department_id?: string }
) {
  const auth = getAuthAdmin();
  if (!auth) {
    console.error('Firebase Admin not initialized');
    return false;
  }
  try {
    await auth.setCustomUserClaims(uid, claims);
    return true;
  } catch (error) {
    console.error('Error setting custom claims:', error);
    return false;
  }
}

// Helper to get user by email
export async function getUserByEmail(email: string) {
  const auth = getAuthAdmin();
  if (!auth) {
    console.error('Firebase Admin not initialized');
    return null;
  }
  try {
    const user = await auth.getUserByEmail(email);
    return user;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}

// Create user with email/password via Admin SDK
export async function createUser(email: string, password: string, userData?: any) {
  const auth = getAuthAdmin();
  if (!auth) {
    throw new Error('Firebase Admin not initialized');
  }
  try {
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: userData?.full_name
    });

    // Set custom claims
    if (userData?.role || userData?.department_id) {
      await setUserCustomClaims(userRecord.uid, {
        role: userData?.role,
        department_id: userData?.department_id
      });
    }

    return userRecord;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}
