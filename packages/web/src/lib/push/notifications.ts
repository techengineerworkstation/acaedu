// Firebase push notifications - stub for now
// Firebase SDK has type issues with this version

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

export async function requestPushPermission(): Promise<string | null> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return null;
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return null;
  }

  return 'stub_token';
}

export async function getFcmToken(): Promise<string | null> {
  try {
    if (!VAPID_KEY) return null;
    return 'stub_fcm_token';
  } catch {
    return null;
  }
}

export function onFcmMessage(callback: (payload: unknown) => void): void {
  // Stub - no-op
}