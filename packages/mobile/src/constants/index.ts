import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from './theme';
import {
  ROLES,
  SCHEDULE_TYPES,
  ANNOUNCEMENT_CATEGORIES,
  PRIORITY_LEVELS,
  ENROLLMENT_STATUS,
  NOTIFICATION_TYPES,
  EVENT_CATEGORIES,
  EXAM_TYPES,
  PROVIDERS,
  SUBSCRIPTION_STATUS,
  PAYMENT_STATUS,
  FEATURES,
  DAYS_OF_WEEK,
  SCHEDULE_BG_COLORS,
  SCHEDULE_TEXT_COLORS,
  API_LIMITS,
  STORAGE_KEYS
} from '@acadion/shared';

export { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS };
export {
  ROLES,
  SCHEDULE_TYPES,
  ANNOUNCEMENT_CATEGORIES,
  PRIORITY_LEVELS,
  ENROLLMENT_STATUS,
  NOTIFICATION_TYPES,
  EVENT_CATEGORIES,
  EXAM_TYPES,
  PROVIDERS,
  SUBSCRIPTION_STATUS,
  PAYMENT_STATUS,
  FEATURES,
  DAYS_OF_WEEK,
  SCHEDULE_BG_COLORS,
  SCHEDULE_TEXT_COLORS,
  API_LIMITS,
  STORAGE_KEYS
};

export const APP_NAME = 'Acaedu';
export const APP_VERSION = '1.0.0';

// Navigation
export const NAVIGATION = {
  MAIN_TABS: {
    HOME: 'home',
    SCHEDULE: 'schedule',
    COURSES: 'courses',
    NOTIFICATIONS: 'notifications',
    PROFILE: 'profile'
  } as const,

  AUTH: {
    LOGIN: 'login',
    REGISTER: 'register',
    FORGOT_PASSWORD: 'forgot-password',
    ROLE_SELECTION: 'role-selection'
  } as const
};

// Deep linking
export const DEEP_LINK = {
  SCHEME: 'acadion',
  HOST: 'acadion.com',
  PATHS: {
    NOTIFICATION: 'notification',
    COURSE: 'course',
    SCHEDULE: 'schedule',
    EXAM: 'exam',
    ASSIGNMENT: 'assignment'
  }
};

// API
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('/rest', '') || 'https://mpuhdybttdaxirinrcsp.supabase.co';
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mpuhdybttdaxirinrcsp.supabase.co';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wdWhkeWJ0dGRheGlyaW5yY3NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNDUzNjQsImV4cCI6MjA5MDgyMTM2NH0.r5a0fJwurwyYaUbWxjJTK_-cBklbLLZIUv4WceEUCPM';

// Storage keys (AsyncStorage)
export const STORAGE_KEYS_Mobile = {
  ...STORAGE_KEYS,
  ONBOARDING_COMPLETE: 'acadion_onboarding_complete',
  FCM_TOKEN: 'acadion_fcm_token',
  PUSH_PERMISSION: 'acadion_push_permission'
};

// Role-based tab configuration
export const ROLE_TAB_CONFIG = {
  student: [
    { name: NAVIGATION.MAIN_TABS.HOME, label: 'Home', icon: 'home' },
    { name: NAVIGATION.MAIN_TABS.SCHEDULE, label: 'Schedule', icon: 'calendar' },
    { name: NAVIGATION.MAIN_TABS.COURSES, label: 'Courses', icon: 'book' },
    { name: NAVIGATION.MAIN_TABS.NOTIFICATIONS, label: 'Alerts', icon: 'bell' },
    { name: NAVIGATION.MAIN_TABS.PROFILE, label: 'Profile', icon: 'user' }
  ],
  lecturer: [
    { name: NAVIGATION.MAIN_TABS.HOME, label: 'Home', icon: 'home' },
    { name: NAVIGATION.MAIN_TABS.COURSES, label: 'Courses', icon: 'book' },
    { name: NAVIGATION.MAIN_TABS.SCHEDULE, label: 'Schedule', icon: 'calendar' },
    { name: NAVIGATION.MAIN_TABS.NOTIFICATIONS, label: 'Alerts', icon: 'bell' },
    { name: NAVIGATION.MAIN_TABS.PROFILE, label: 'Profile', icon: 'user' }
  ],
  admin: [
    { name: NAVIGATION.MAIN_TABS.HOME, label: 'Home', icon: 'home' },
    { name: NAVIGATION.MAIN_TABS.COURSES, label: 'Users', icon: 'users' },
    { name: NAVIGATION.MAIN_TABS.SCHEDULE, label: 'Schedule', icon: 'calendar' },
    { name: NAVIGATION.MAIN_TABS.NOTIFICATIONS, label: 'Announce', icon: 'megaphone' },
    { name: NAVIGATION.MAIN_TABS.PROFILE, label: 'Profile', icon: 'admin' }
  ]
};
