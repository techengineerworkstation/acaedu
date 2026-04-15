import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getMessaging, type Messaging } from 'firebase/messaging';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;
let storage: FirebaseStorage | null = null;

// Initialize Firebase App (only if config is present)
if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }

  // Initialize messaging (only in browser environment)
  if (typeof window !== 'undefined' && app) {
    try {
      messaging = getMessaging(app);
    } catch (e) {
      console.warn('Firebase Messaging initialization failed:', e);
      messaging = null;
    }
  }

  // Initialize storage
  if (app) {
    try {
      storage = getStorage(app);
    } catch (e) {
      console.warn('Firebase Storage initialization failed:', e);
      storage = null;
    }
  }
} else {
  console.warn('Firebase config incomplete. Messaging and Storage will not be available.');
}

export { app, messaging, storage };
