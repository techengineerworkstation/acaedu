// Extended types for Phase 2-5 features
import { User, UserRole, Course } from './index';

// Institution (multi-tenant)
export interface Institution {
  id: string;
  name: string;
  code: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  domain?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  is_active: boolean;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Faculty
export interface Faculty {
  id: string;
  institution_id: string;
  name: string;
  code: string;
  dean_id?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  dean?: User;
  institution?: Institution;
}

// Extended User Profile
export interface UserProfile extends User {
  institution_id?: string;
  faculty_id?: string;
  gender?: string;
  date_of_birth?: string;
  address?: string;
  matriculation_number?: string;
  level?: string;
  bio?: string;
  emergency_contact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  is_active: boolean;
  last_login?: string;
  notification_preferences?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

// Attendance
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface Attendance {
  id: string;
  schedule_id: string;
  schedule_instance_id?: string;
  student_id: string;
  course_id: string;
  status: AttendanceStatus;
  check_in_time?: string;
  check_out_time?: string;
  notes?: string;
  recorded_by?: string;
  created_at: string;
  student?: User;
}

export interface AttendanceStats {
  student_id: string;
  student_name: string;
  total_sessions: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  attendance_rate: number;
}

// Lecture Videos
export type VideoType = 'external' | 'youtube' | 'vimeo' | 'uploaded';

export interface LectureVideo {
  id: string;
  course_id: string;
  schedule_id?: string;
  title: string;
  description?: string;
  video_url: string;
  video_type: VideoType;
  thumbnail_url?: string;
  duration_seconds?: number;
  semester?: string;
  academic_year?: string;
  ai_summary?: string;
  ai_key_points?: string[];
  ai_transcript?: string;
  is_published: boolean;
  view_count: number;
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
  course?: Course;
}

// Class Venues
export interface ClassVenue {
  id: string;
  institution_id?: string;
  name: string;
  building?: string;
  floor?: string;
  room_number?: string;
  capacity: number;
  latitude?: number;
  longitude?: number;
  image_urls: string[];
  facilities: string[];
  directions?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Course Materials
export type MaterialType = 'document' | 'presentation' | 'spreadsheet' | 'pdf' | 'image' | 'video' | 'audio' | 'other';

export interface CourseMaterial {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
  material_type: MaterialType;
  week_number?: number;
  is_published: boolean;
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
}

// Course Outline
export interface CourseOutline {
  id: string;
  course_id: string;
  week_number: number;
  title: string;
  description?: string;
  learning_objectives: string[];
  topics: string[];
  readings?: string;
  created_at: string;
}

// CRM Integration
export type CRMProvider = 'hubspot' | 'salesforce' | 'zendesk';

export interface CRMSync {
  id: string;
  user_id: string;
  provider: CRMProvider;
  external_id?: string;
  sync_type: string;
  last_synced_at: string;
  sync_data: Record<string, any>;
  created_at: string;
}

// Event Registration
export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  registered_at: string;
  attended: boolean;
}

// Population Census
export interface PopulationCensus {
  department_name: string;
  faculty_name?: string;
  total_count: number;
  male_count: number;
  female_count: number;
  active_count: number;
}

// AI Video Summary Request
export interface VideoSummaryRequest {
  video_id: string;
  video_url: string;
  language?: string;
}

export interface VideoSummaryResponse {
  summary: string;
  key_points: string[];
  transcript?: string;
}

// Text-to-Speech Request
export interface TTSRequest {
  text: string;
  language?: string;
  voice?: string;
}

// Billing Plans Display
export interface PlanFeature {
  name: string;
  included: boolean;
  limit?: string;
}

export interface PlanDisplay {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: PlanFeature[];
  is_popular?: boolean;
}

// Admin Dashboard Stats
export interface AdminStats {
  total_students: number;
  total_lecturers: number;
  total_courses: number;
  active_enrollments: number;
  total_revenue: number;
  active_subscriptions: number;
  recent_signups: number;
  upcoming_events: number;
}

// Notification with color coding
export interface NotificationDisplay {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  color: string; // departmental vs general
  is_departmental: boolean;
}

// Search
export interface SearchResult {
  type: 'course' | 'user' | 'announcement' | 'event' | 'material';
  id: string;
  title: string;
  description?: string;
  url: string;
}
