// Application constants
export const APP_NAME = 'Acaedu';
export const APP_DESCRIPTION = 'Smart Academic Notification & Scheduling System';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// User Roles
export const ROLES = {
  STUDENT: 'student' as const,
  LECTURER: 'lecturer' as const,
  ADMIN: 'admin' as const
} as const;

export const ROLES_ARRAY = ['student', 'lecturer', 'admin'] as const;

// Role Display Names
export const ROLE_LABELS: Record<string, string> = {
  student: 'Student',
  lecturer: 'Lecturer',
  admin: 'Administrator'
};

// Default Avatar
export const DEFAULT_AVATAR = '/images/default-avatar.png';

// Notification Types
export const NOTIFICATION_TYPES = {
  ANNOUNCEMENT: 'announcement',
  SCHEDULE_REMINDER: 'schedule_reminder',
  SCHEDULE_CHANGE: 'schedule_change',
  GRADE_POSTED: 'grade_posted',
  ASSIGNMENT_DUE: 'assignment_due',
  PAYMENT_REMINDER: 'payment_reminder',
  SYSTEM_MAINTENANCE: 'system_maintenance',
  EXAM_REMINDER: 'exam_reminder'
} as const;

// Announcement Categories
export const ANNOUNCEMENT_CATEGORIES = {
  GENERAL: 'general',
  ACADEMIC: 'academic',
  EVENT: 'event',
  EMERGENCY: 'emergency',
  BILLING: 'billing',
  MAINTENANCE: 'maintenance'
} as const;

export const ANNOUNCEMENT_CATEGORY_LABELS: Record<string, string> = {
  general: 'General',
  academic: 'Academic',
  event: 'Event',
  emergency: 'Emergency Alert',
  billing: 'Billing',
  maintenance: 'System Maintenance'
};

// Priority Levels
export const PRIORITY_LEVELS = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
} as const;

export const PRIORITY_LABELS: Record<string, string> = {
  low: 'Low',
  normal: 'Normal',
  high: 'High',
  urgent: 'Urgent'
};

// Schedule Types
export const SCHEDULE_TYPES = {
  LECTURE: 'lecture',
  TUTORIAL: 'tutorial',
  LAB: 'lab',
  EXAM: 'exam',
  ASSIGNMENT: 'assignment'
} as const;

export const SCHEDULE_TYPE_LABELS: Record<string, string> = {
  lecture: 'Lecture',
  tutorial: 'Tutorial',
  lab: 'Laboratory',
  exam: 'Examination',
  assignment: 'Assignment'
};

// Schedule Type Colors
export const SCHEDULE_TYPE_COLORS: Record<string, string> = {
  lecture: '#3B82F6', // blue
  tutorial: '#10B981', // green
  lab: '#F59E0B', // amber
  exam: '#EF4444', // red
  assignment: '#8B5CF6' // purple
};

// Enrollment Status
export const ENROLLMENT_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  DROPPED: 'dropped',
  FAILED: 'failed'
} as const;

export const ENROLLMENT_STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  completed: 'Completed',
  dropped: 'Dropped',
  failed: 'Failed'
};

// Event Categories
export const EVENT_CATEGORIES = {
  ACADEMIC: 'academic',
  SOCIAL: 'social',
  SPORTS: 'sports',
  CAREER: 'career',
  OTHER: 'other'
} as const;

export const EVENT_CATEGORY_LABELS: Record<string, string> = {
  academic: 'Academic',
  social: 'Social',
  sports: 'Sports',
  career: 'Career',
  other: 'Other'
};

// Exam Types
export const EXAM_TYPES = {
  MIDTERM: 'midterm',
  FINAL: 'final',
  QUIZ: 'quiz',
  ASSIGNMENT: 'assignment',
  TEST: 'test'
} as const;

export const EXAM_TYPE_LABELS: Record<string, string> = {
  midterm: 'Midterm Exam',
  final: 'Final Exam',
  quiz: 'Quiz',
  assignment: 'Assignment',
  test: 'Test'
};

// Subscription Providers
export const PROVIDERS = {
  PAYSTACK: 'paystack',
  PAYPAL: 'paypal'
} as const;

// Subscription Status
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  CANCELED: 'canceled',
  PAST_DUE: 'past_due',
  UNPAID: 'unpaid',
  TRIALING: 'trialing'
} as const;

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
} as const;

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  PRO: 'pro',
  ENTERPRISE: 'enterprise'
} as const;

export const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  pro: 'Pro',
  enterprise: 'Enterprise'
};

export const PLAN_PRICES: Record<string, { monthly: number; yearly: number }> = {
  free: { monthly: 0, yearly: 0 },
  pro: { monthly: 9.99, yearly: 99.99 },
  enterprise: { monthly: 29.99, yearly: 299.99 }
};

// Feature Names
export const FEATURES = {
  UNLIMITED_COURSES: 'unlimited_courses',
  UNLIMITED_NOTIFICATIONS: 'unlimited_notifications',
  PUSH_NOTIFICATIONS: 'push_notifications',
  EMAIL_NOTIFICATIONS: 'email_notifications',
  AI_SCHEDULER: 'ai_scheduler',
  ADVANCED_ANALYTICS: 'advanced_analytics',
  PRIORITY_SUPPORT: 'priority_support',
  CUSTOM_BRANDING: 'custom_branding'
} as const;

// Recurrence Rules
export const RECURRENCE_PATTERNS = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
  YEARLY: 'YEARLY'
} as const;

// Days of Week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
export const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const DAYS_OF_WEEK_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Notification Channels
export const NOTIFICATION_CHANNELS = {
  IN_APP: 'in_app',
  EMAIL: 'email',
  PUSH: 'push',
  SMS: 'sms'
} as const;

// API Limits
export const API_LIMITS = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  NOTIFICATIONS_PER_PAGE: 50,
  COURSES_PER_PAGE: 50,
  SCHEDULES_PER_PAGE: 100
};

// Storage Keys (for mobile/web local storage)
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'acadion_auth_token',
  USER: 'acadion_user',
  THEME: 'acadion_theme',
  LANGUAGE: 'acadion_language',
  PUSH_TOKEN: 'acadion_push_token',
  LAST_SYNC: 'acadion_last_sync'
};

// Colors
export const COLORS = {
  PRIMARY: '#3B82F6',
  PRIMARY_DARK: '#2563EB',
  SECONDARY: '#10B981',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  GRAY_50: '#F9FAFB',
  GRAY_100: '#F3F4F6',
  GRAY_200: '#E5E7EB',
  GRAY_300: '#D1D5DB',
  GRAY_400: '#9CA3AF',
  GRAY_500: '#6B7280',
  GRAY_600: '#4B5563',
  GRAY_700: '#374151',
  GRAY_800: '#1F2937',
  GRAY_900: '#111827'
};

// Schedule Background Colors (by type)
export const SCHEDULE_BG_COLORS: Record<string, string> = {
  lecture: '#DBEAFE', // light blue
  tutorial: '#D1FAE5', // light green
  lab: '#FEF3C7', // light amber
  exam: '#FEE2E2', // light red
  assignment: '#EDE9FE' // light purple
};

export const SCHEDULE_TEXT_COLORS: Record<string, string> = {
  lecture: '#1E40AF',
  tutorial: '#065F46',
  lab: '#92400E',
  exam: '#991B1B',
  assignment: '#5B21B6'
};

// Environment
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
