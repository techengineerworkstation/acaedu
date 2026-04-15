import { messaging } from '@/lib/firebase/client';
import { getToken, onMessage } from 'firebase/messaging';
import { toast } from 'react-hot-toast';

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

export async function requestPushPermission(): Promise<string | null> {
  try {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return null;
    }

    // Register service worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

    if (!messaging) return null;

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    return token;
  } catch (error) {
    console.error('Push permission error:', error);
    return null;
  }
}

export function setupForegroundNotifications() {
  if (typeof window === 'undefined') return;

  if (!messaging) return;

  onMessage(messaging, (payload) => {
    const title = payload.notification?.title || 'Acaedu';
    const body = payload.notification?.body || '';

    // Show toast notification
    toast(body, {
      duration: 6000,
      icon: getNotificationIcon(payload.data?.type),
      style: { maxWidth: '400px' }
    });

    // Also show browser notification if page is visible
    if (document.visibilityState === 'visible') {
      new Notification(title, {
        body,
        icon: '/icons/icon-192x192.png',
        tag: payload.data?.type || 'default'
      });
    }

    // Play alarm sound for class notifications
    if (payload.data?.type === 'schedule_reminder') {
      playAlarmSound();
    }
  });
}

function getNotificationIcon(type?: string): string {
  switch (type) {
    case 'announcement': return '📢';
    case 'schedule_reminder': return '⏰';
    case 'schedule_change': return '📅';
    case 'grade_posted': return '📊';
    case 'assignment_due': return '📝';
    case 'exam_reminder': return '📋';
    case 'payment_reminder': return '💳';
    default: return '🔔';
  }
}

function playAlarmSound() {
  try {
    const audio = new Audio('/sounds/alarm.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {});
  } catch {}
}

export async function savePushToken(userId: string, token: string) {
  try {
    await fetch('/api/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: userId,
        notification_preferences: { push_token: token, push: true }
      })
    });
  } catch (error) {
    console.error('Failed to save push token:', error);
  }
}
