import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { messaging, getFCMToken } from '../auth/firebase';
import { COLORS } from '../../constants/theme';
import { STORAGE_KEYS_Mobile } from '../../constants';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true
  })
});

export async function registerForPushNotifications(): Promise<string | null> {
  try {
    // Request permissions
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }

    // Get FCM token
    const fcmToken = await getFCMToken();
    if (fcmToken) {
      // Save token to storage
      await AsyncStorage.setItem(STORAGE_KEYS_Mobile.FCM_TOKEN, fcmToken);

      // TODO: Send token to backend to associate with user
      // await sendTokenToBackend(fcmToken);

      console.log('FCM Token:', fcmToken);
      return fcmToken;
    }

    return null;
  } catch (error) {
    console.error('Push notification registration error:', error);
    return null;
  }
}

/**
 * Schedule a local notification (for reminders)
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: Record<string, any>,
  triggerSeconds: number = 60
): Promise<string> {
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true
    },
    trigger: { seconds: triggerSeconds }
  });

  return identifier;
}

/**
 * Cancel a scheduled notification
 */
export async function cancelNotification(identifier: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(identifier);
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Set badge count
 */
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

/**
 * Listen for notifications (while app is foreground)
 */
export function addNotificationListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(response => {
    callback(response.notification);
  });
}

/**
 * Handle notification that opened the app
 */
export async function getLastNotificationResponse(): Promise<Notifications.NotificationResponse | null> {
  return await Notifications.getLastNotificationResponseAsync();
}

/**
 * Configure notification appearance (iOS)
 */
export async function configureNotificationChannel(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('acadion', {
      name: 'Acaedu Notifications',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: COLORS.primary[600],
      enableVibrate: true,
      enableLights: true
    });
  }
}
