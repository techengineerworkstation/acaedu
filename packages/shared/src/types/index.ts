// User & Auth Types
export type UserRole = 'student' | 'lecturer' | 'admin';

export interface User {
  id: string;
  role: UserRole;
  department_id?: string;
  student_id?: string;
  employee_id?: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  email: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  user: User;
  expires_at: number;
}

// Department
export interface Department {
  id: string;
  name: string;
  code: string;
  created_at: string;
}

// Course Types
export interface Course {
  id: string;
  course_code: string;
  title: string;
  description?: string;
  summary?: string; // Course summary for student preview with TTS
  credits: number;
  department_id: string;
  lecturer_id: string;
  capacity: number;
  enrolled_count: number;
  is_active: boolean;
  color?: string; // Optional custom color for calendar
  created_at: string;
  department?: Department;
  lecturer?: User;
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  enrolled_at: string;
  status: EnrollmentStatus;
  course?: Course;
}

export type EnrollmentStatus = 'active' | 'completed' | 'dropped' | 'failed';

// Schedule Types
export type ScheduleType = 'lecture' | 'tutorial' | 'lab' | 'exam' | 'assignment';

export interface Schedule {
  id: string;
  course_id: string;
  lecturer_id: string;
  title: string;
  description?: string;
  schedule_type: ScheduleType;
  start_time: string;
  end_time: string;
  location?: string;
  is_recurring: boolean;
  recurrence_rule?: string;
  recurring_end_date?: string;
  attachments: Attachment[];
  created_at: string;
  updated_at: string;
  course?: Course;
}

export interface ScheduleInstance {
  id: string;
  schedule_id: string;
  instance_date: string;
  start_time: string;
  end_time: string;
  location?: string;
  is_cancelled: boolean;
  cancellation_reason?: string;
  created_at: string;
}

// Attachment
export interface Attachment {
  name: string;
  url: string;
  size: number;
  type: string;
}

// Announcement Types
export type AnnouncementCategory = 'general' | 'academic' | 'event' | 'emergency' | 'billing' | 'maintenance';
export type PriorityLevel = 'low' | 'normal' | 'high' | 'urgent';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: AnnouncementCategory;
  priority: PriorityLevel;
  target_roles: UserRole[];
  target_courses?: string[];
  attachments: Attachment[];
  author_id: string;
  is_published: boolean;
  published_at?: string;
  expires_at?: string;
  created_at: string;
  author?: User;
}

// Notification Types
export type NotificationType =
  | 'announcement'
  | 'schedule_reminder'
  | 'schedule_change'
  | 'grade_posted'
  | 'assignment_due'
  | 'payment_reminder'
  | 'system_maintenance'
  | 'exam_reminder';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, any>;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

// Event Types
export type EventCategory = 'academic' | 'social' | 'sports' | 'career' | 'other';

export interface Event {
  id: string;
  title: string;
  description?: string;
  category: EventCategory;
  start_date: string;
  end_date: string;
  location?: string;
  organizer_id: string;
  is_public: boolean;
  max_participants?: number;
  registration_required: boolean;
  attachments: Attachment[];
  created_at: string;
  organizer?: User;
}

// Exam Types
export type ExamType = 'midterm' | 'final' | 'quiz' | 'assignment' | 'test';

export interface Exam {
  id: string;
  course_id: string;
  title: string;
  exam_type: ExamType;
  exam_date: string;
  duration_minutes: number;
  location?: string;
  total_marks: number;
  passing_marks: number;
  instructions?: string;
  attachments: Attachment[];
  created_at: string;
  updated_at: string;
  course?: Course;
}

// Assignment Types
export interface Assignment {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  due_date: string;
  total_points: number;
  attachment_urls: Attachment[];
  created_at: string;
  updated_at: string;
  course?: Course;
}

// Grade Types
export interface Grade {
  id: string;
  student_id: string;
  assignment_id?: string;
  exam_id?: string;
  points_earned?: number;
  percentage?: number;
  grade_letter?: string;
  submitted_at?: string;
  graded_at?: string;
  feedback?: string;
  attachment_urls: Attachment[];
  assignment?: Assignment;
  exam?: Exam;
}

// Billing Types
export type ProviderType = 'paystack' | 'paypal';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface BillingSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  provider: ProviderType;
  provider_subscription_id: string;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  subscription_id?: string;
  provider: ProviderType;
  provider_payment_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  description?: string;
  paid_at?: string;
  created_at: string;
}

export type FeatureName =
  | 'unlimited_courses'
  | 'unlimited_notifications'
  | 'push_notifications'
  | 'email_notifications'
  | 'ai_scheduler'
  | 'advanced_analytics'
  | 'priority_support'
  | 'custom_branding';

export interface FeatureAccess {
  id: string;
  plan_id: string;
  feature: FeatureName;
  is_enabled: boolean;
  limits: Record<string, any>;
}

// AI Scheduler Types
export interface CourseConstraint {
  id?: string;
  user_id: string;
  course_id: string;
  preferred_days: number[]; // 0-6 (Sunday-Saturday)
  preferred_start_time?: string; // HH:MM
  preferred_end_time?: string;
  avoid_conflicts_with?: string[];
}

export interface AISuggestion {
  id: string;
  user_id: string;
  course_id: string;
  suggested_start_time: string;
  suggested_end_time: string;
  confidence_score: number; // 0.00 - 1.00
  reasoning: string; // JSON string
  is_accepted: boolean;
  created_at: string;
}

export interface SchedulerInput {
  courses: Course[];
  existingSchedules: Schedule[];
  preferences: {
    preferred_days?: number[];
    preferred_time_range?: { start: string; end: string };
    max_hours_per_day?: number;
  };
  rooms: Array<{ id: string; name: string; capacity: number }>;
  userId: string;
  role: UserRole;
}

export interface SchedulerOutput {
  courseId: string;
  startTime: string;
  endTime: string;
  confidence: number;
  reasoning: string[];
  roomId?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Subscription Plan
export interface SubscriptionPlan {
  id: string;
  institution_id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  currency_code: string;
  max_users: number;
  features: string[]; // Array of feature names
  is_active: boolean;
  is_default?: boolean;
  created_at: string;
  updated_at: string;
}

// Notification Payload
export interface NotificationPayload {
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  userId?: string; // If not provided, broadcast to role/department
  targetRole?: UserRole;
  targetDepartment?: string;
}

// Date/Time utilities
