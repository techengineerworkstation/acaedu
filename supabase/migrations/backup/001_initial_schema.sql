-- =====================================================
-- Acadion Database Schema
-- Version: 1.0.0
-- Description: Full schema for Smart Academic Notification & Scheduling System
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENUMS
-- =====================================================

-- User roles
CREATE TYPE public.user_role AS ENUM ('student', 'lecturer', 'admin');

-- Enrollment status
CREATE TYPE public.enrollment_status AS ENUM ('active', 'completed', 'dropped', 'failed');

-- Schedule types
CREATE TYPE public.schedule_type AS ENUM (
  'lecture',
  'tutorial',
  'lab',
  'exam',
  'assignment'
);

-- Announcement categories
CREATE TYPE public.announcement_category AS ENUM (
  'general',
  'academic',
  'event',
  'emergency',
  'billing',
  'maintenance'
);

-- Priority levels
CREATE TYPE public.priority_level AS ENUM ('low', 'normal', 'high', 'urgent');

-- Notification types
CREATE TYPE public.notification_type AS ENUM (
  'announcement',
  'schedule_reminder',
  'schedule_change',
  'grade_posted',
  'assignment_due',
  'payment_reminder',
  'system_maintenance',
  'exam_reminder'
);

-- Event categories
CREATE TYPE public.event_category AS ENUM ('academic', 'social', 'sports', 'career', 'other');

-- Exam types
CREATE TYPE public.exam_type AS ENUM ('midterm', 'final', 'quiz', 'assignment', 'test');

-- Payment providers
CREATE TYPE public.provider_type AS ENUM ('paystack', 'paypal');

-- Subscription status
CREATE TYPE public.subscription_status AS ENUM (
  'active',
  'canceled',
  'past_due',
  'unpaid',
  'trialing'
);

-- Payment status
CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Feature names for paywall
CREATE TYPE public.feature_name AS ENUM (
  'unlimited_courses',
  'unlimited_notifications',
  'push_notifications',
  'email_notifications',
  'ai_scheduler',
  'advanced_analytics',
  'priority_support',
  'custom_branding'
);

-- =====================================================
-- TABLES
-- =====================================================

-- Departments
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (extends auth.users from Supabase/Firebase)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  role user_role DEFAULT 'student',
  department UUID REFERENCES departments(id) ON DELETE SET NULL,
  student_id VARCHAR(100) UNIQUE,
  employee_id VARCHAR(100) UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  phone VARCHAR(50),
  email VARCHAR(255) UNIQUE,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  credits INTEGER DEFAULT 3,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  lecturer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  capacity INTEGER DEFAULT 30,
  enrolled_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enrollments (student <-> course many-to-many)
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  status enrollment_status DEFAULT 'active',
  UNIQUE(student_id, course_id)
);

-- Schedules (class sessions)
CREATE TABLE public.schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  lecturer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  schedule_type schedule_type NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location VARCHAR(500),
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_rule TEXT, -- RRULE format string
  recurring_end_date DATE,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schedule instances (generated recurring occurrences)
CREATE TABLE public.schedule_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
  instance_date DATE NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location VARCHAR(500),
  is_cancelled BOOLEAN DEFAULT FALSE,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(schedule_id, instance_date)
);

-- Announcements
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(1000) NOT NULL,
  content TEXT NOT NULL,
  category announcement_category DEFAULT 'general',
  priority priority_level DEFAULT 'normal',
  target_roles user_role[] NOT NULL DEFAULT '{}',
  target_courses UUID[],
  attachments JSONB DEFAULT '[]'::jsonb,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_published BOOLEAN DEFAULT TRUE,
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title VARCHAR(1000) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events (campus events)
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  category event_category DEFAULT 'other',
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  location VARCHAR(500),
  organizer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT TRUE,
  max_participants INTEGER,
  registration_required BOOLEAN DEFAULT FALSE,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exams
CREATE TABLE public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  exam_type exam_type DEFAULT 'final',
  exam_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL,
  location VARCHAR(500),
  total_marks INTEGER DEFAULT 100,
  passing_marks INTEGER DEFAULT 50,
  instructions TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assignments
CREATE TABLE public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ NOT NULL,
  total_points INTEGER DEFAULT 100,
  attachment_urls JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grades
CREATE TABLE public.grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  points_earned DECIMAL(5,2),
  percentage DECIMAL(5,2),
  grade_letter VARCHAR(5),
  submitted_at TIMESTAMPTZ,
  graded_at TIMESTAMPTZ,
  feedback TEXT,
  attachment_urls JSONB DEFAULT '[]'::jsonb,
  UNIQUE(student_id, assignment_id),
  UNIQUE(student_id, exam_id)
);

-- Billing subscriptions
CREATE TABLE public.billing_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id VARCHAR(100) NOT NULL,
  provider provider_type NOT NULL,
  provider_subscription_id VARCHAR(500) UNIQUE NOT NULL,
  status subscription_status DEFAULT 'active',
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES billing_subscriptions(id) ON DELETE SET NULL,
  provider provider_type NOT NULL,
  provider_payment_id VARCHAR(500) UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status payment_status DEFAULT 'pending',
  description TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feature access (paywall configuration)
CREATE TABLE public.feature_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id VARCHAR(100) NOT NULL,
  feature feature_name NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  limits JSONB DEFAULT '{}'::jsonb,
  UNIQUE(plan_id, feature)
);

-- AI scheduler suggestions
CREATE TABLE public.ai_scheduler_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  suggested_start_time TIMESTAMPTZ NOT NULL,
  suggested_end_time TIMESTAMPTZ NOT NULL,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  reasoning TEXT,
  is_accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Users
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_department ON public.users(department);

-- Courses
CREATE INDEX idx_courses_department ON public.courses(department_id);
CREATE INDEX idx_courses_lecturer ON public.courses(lecturer_id);
CREATE INDEX idx_courses_active ON public.courses(is_active);

-- Enrollments
CREATE INDEX idx_enrollments_student ON public.enrollments(student_id);
CREATE INDEX idx_enrollments_course ON public.enrollments(course_id);
CREATE INDEX idx_enrollments_status ON public.enrollments(status);

-- Schedules
CREATE INDEX idx_schedules_course ON public.schedules(course_id);
CREATE INDEX idx_schedules_lecturer ON public.schedules(lecturer_id);
CREATE INDEX idx_schedules_time ON public.schedules(start_time, end_time);

-- Schedule instances
CREATE INDEX idx_schedule_instances_schedule ON public.schedule_instances(schedule_id);
CREATE INDEX idx_schedule_instances_date ON public.schedule_instances(instance_date);

-- Announcements
CREATE INDEX idx_announcements_author ON public.announcements(author_id);
CREATE INDEX idx_announcements_published ON public.announcements(is_published, published_at);
CREATE INDEX idx_announcements_category ON public.announcements(category);
CREATE INDEX idx_announcements_priority ON public.announcements(priority);

-- Notifications
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);

-- Events
CREATE INDEX idx_events_dates ON public.events(start_date, end_date);
CREATE INDEX idx_events_organizer ON public.events(organizer_id);

-- Exams
CREATE INDEX idx_exams_course ON public.exams(course_id);
CREATE INDEX idx_exams_date ON public.exams(exam_date);

-- Assignments
CREATE INDEX idx_assignments_course ON public.assignments(course_id);
CREATE INDEX idx_assignments_due_date ON public.assignments(due_date);

-- Grades
CREATE INDEX idx_grades_student ON public.grades(student_id);
CREATE INDEX idx_grades_assignment ON public.grades(assignment_id);
CREATE INDEX idx_grades_exam ON public.grades(exam_id);

-- Billing
CREATE INDEX idx_billing_subscriptions_user ON public.billing_subscriptions(user_id);
CREATE INDEX idx_billing_subscriptions_status ON public.billing_subscriptions(status);
CREATE INDEX idx_payments_user ON public.payments(user_id);
CREATE INDEX idx_payments_created ON public.payments(created_at DESC);

-- AI suggestions
CREATE INDEX idx_ai_suggestions_user ON public.ai_scheduler_suggestions(user_id);
CREATE INDEX idx_ai_suggestions_course ON public.ai_scheduler_suggestions(course_id);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_scheduler_suggestions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Departments - readable by all authenticated users
CREATE POLICY "Authenticated users can view departments" ON public.departments
  FOR SELECT USING (auth.role() = 'authenticated');

-- Courses policies
CREATE POLICY "Anyone can view active courses" ON public.courses
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Enrolled students can view their courses" ON public.courses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE student_id = auth.uid()
      AND course_id = public.courses.id
      AND status = 'active'
    )
  );

CREATE POLICY "Lecturers can view their courses" ON public.courses
  FOR SELECT USING (lecturer_id = auth.uid());

CREATE POLICY "Admins can view all courses" ON public.courses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins and lecturers can insert courses" ON public.courses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'lecturer')
    )
  );

CREATE POLICY "Course owners can update" ON public.courses
  FOR UPDATE USING (lecturer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Enrollments policies
CREATE POLICY "Students can view own enrollments" ON public.enrollments
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Lecturers can view enrollments for their courses" ON public.enrollments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = enrollments.course_id
      AND courses.lecturer_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all enrollments" ON public.enrollments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Students can enroll in courses" ON public.enrollments
  FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can drop courses" ON public.enrollments
  FOR UPDATE USING (student_id = auth.uid());

-- Schedules policies
CREATE POLICY "Schedules are visible to enrolled users" ON public.schedules
  FOR SELECT USING (
    -- Course is active and user is enrolled
    EXISTS (
      SELECT 1 FROM public.courses c
      JOIN public.enrollments e ON e.course_id = c.id
      WHERE c.id = schedules.course_id
      AND e.student_id = auth.uid()
      AND e.status = 'active'
    )
    OR schedules.lecturer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Lecturers can manage their schedules" ON public.schedules
  FOR ALL USING (
    lecturer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- Announcements policies
CREATE POLICY "Published announcements visible to target roles" ON public.announcements
  FOR SELECT USING (
    is_published = TRUE
    AND (target_roles @> ARRAY[
      (SELECT role FROM public.users WHERE id = auth.uid())
    ]::user_role[])
    AND (target_courses IS NULL OR target_courses @> (
      SELECT ARRAY_AGG(course_id)
      FROM public.enrollments
      WHERE student_id = auth.uid() AND status = 'active'
    ))
  );

CREATE POLICY "Authors can manage their announcements" ON public.announcements
  FOR ALL USING (author_id = auth.uid());

CREATE POLICY "Admins can manage all announcements" ON public.announcements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (
    -- Allow inserts from service role or admin users
    auth.uid() IS NULL OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'lecturer')
    )
  );

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Events policies
CREATE POLICY "Public events visible to all" ON public.events
  FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Organizers can manage their events" ON public.events
  FOR ALL USING (organizer_id = auth.uid());

CREATE POLICY "Admins can manage all events" ON public.events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Exams policies
CREATE POLICY "Exams visible to enrolled students and lecturers" ON public.exams
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      JOIN public.enrollments e ON e.course_id = c.id
      WHERE c.id = exams.course_id
      AND e.student_id = auth.uid()
      AND e.status = 'active'
    )
    OR EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = exams.course_id
      AND courses.lecturer_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Lecturers can manage exams for their courses" ON public.exams
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = exams.course_id
      AND courses.lecturer_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Assignments policies (similar to exams)
CREATE POLICY "Assignments visible to enrolled students and lecturers" ON public.assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      JOIN public.enrollments e ON e.course_id = c.id
      WHERE c.id = assignments.course_id
      AND e.student_id = auth.uid()
      AND e.status = 'active'
    )
    OR EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = assignments.course_id
      AND courses.lecturer_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Lecturers can manage assignments" ON public.assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = assignments.course_id
      AND courses.lecturer_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Grades policies
CREATE POLICY "Students can view own grades" ON public.grades
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Lecturers can view grades for their courses" ON public.grades
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.assignments a
      JOIN public.courses c ON c.id = a.course_id
      WHERE a.id = grades.assignment_id
      AND c.lecturer_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.exams e
      JOIN public.courses c ON c.id = e.course_id
      WHERE e.id = grades.exam_id
      AND c.lecturer_id = auth.uid()
    )
  );

CREATE POLICY "Lecturers can insert/update grades" ON public.grades
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.assignments a
      JOIN public.courses c ON c.id = a.course_id
      WHERE a.id = grades.assignment_id
      AND c.lecturer_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.exams e
      JOIN public.courses c ON c.id = e.course_id
      WHERE e.id = grades.exam_id
      AND c.lecturer_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Billing subscriptions policies
CREATE POLICY "Users can view own subscription" ON public.billing_subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Service role can manage subscriptions" ON public.billing_subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- Payments policies
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Service role can manage payments" ON public.payments
  FOR ALL USING (auth.role() = 'service_role');

-- Feature access policies (readable by authenticated)
CREATE POLICY "Feature access readable by authenticated" ON public.feature_access
  FOR SELECT USING (auth.role() = 'authenticated');

-- AI scheduler suggestions policies
CREATE POLICY "Users can view own suggestions" ON public.ai_scheduler_suggestions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own suggestions" ON public.ai_scheduler_suggestions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own suggestions" ON public.ai_scheduler_suggestions
  FOR UPDATE USING (user_id = auth.uid());

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to check schedule conflicts for a user
CREATE OR REPLACE FUNCTION public.check_schedule_conflicts(
  schedule_id UUID,
  check_date DATE,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ
)
RETURNS TABLE (
  conflicting_schedule_id UUID,
  conflicting_title VARCHAR,
  overlap_minutes INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.title,
    EXTRACT(EPOCH FROM (
      LEAST(s.end_time, end_time) - GREATEST(s.start_time, start_time)
    )) / 60 as overlap_minutes
  FROM public.schedules s
  JOIN public.courses c ON c.id = s.course_id
  JOIN public.enrollments e ON e.course_id = c.id
  WHERE e.student_id = auth.uid()
    AND e.status = 'active'
    AND s.id != schedule_id
    AND s.start_time < end_time
    AND s.end_time > start_time
    AND (
      (s.is_recurring = FALSE AND s.start_time::DATE = check_date)
      OR (
        s.is_recurring = TRUE
        AND check_date BETWEEN s.start_time::DATE AND COALESCE(s.recurring_end_date, check_date)
        AND (s.recurrence_rule IS NULL OR is_date_in_rrule(check_date, s.recurrence_rule))
      )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if date is in RRULE (simplified)
-- For full RRULE support, use pg_rrule extension or handle in app
CREATE OR REPLACE FUNCTION public.is_date_in_rrule(
  check_date DATE,
  rrule TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Simplified: check for weekly recurrence
  IF rrule LIKE 'FREQ=WEEKLY%' THEN
    -- Extract BYDAY if present
    IF rrule LIKE '%BYDAY=%' THEN
      DECLARE
        byday_part TEXT;
        day_codes TEXT[];
        day_num INTEGER;
      BEGIN
        byday_part := substring(rrule from 'BYDAY=([A-Z,]+)');
        day_codes := string_to_array(byday_part, ',');
        FOR day_num IN SELECT generate_series(0, 6) LOOP
          IF (
            (day_num = 0 AND 'SU' = ANY(day_codes)) OR
            (day_num = 1 AND 'MO' = ANY(day_codes)) OR
            (day_num = 2 AND 'TU' = ANY(day_codes)) OR
            (day_num = 3 AND 'WE' = ANY(day_codes)) OR
            (day_num = 4 AND 'TH' = ANY(day_codes)) OR
            (day_num = 5 AND 'FR' = ANY(day_codes)) OR
            (day_num = 6 AND 'SA' = ANY(day_codes))
          ) THEN
            IF EXTRACT(DOW FROM check_date) = day_num THEN
              RETURN TRUE;
            END IF;
          END IF;
        END LOOP;
      END;
    ELSE
      -- Every week on the same day as start date
      -- Get the start day from rrule would be more complex
      -- For now, return true if same day of week as today
      -- In production, use proper RRULE library in application layer
      RETURN TRUE;
    END IF;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to generate schedule instances for recurring schedules
CREATE OR REPLACE FUNCTION public.generate_schedule_instances(
  schedule_id UUID,
  from_date DATE DEFAULT CURRENT_DATE,
  days_ahead INTEGER DEFAULT 90
)
RETURNS SETOF public.schedule_instances AS $$
DECLARE
  schedule_record RECORD;
  instance_date DATE;
  end_date DATE;
  recurrence_rule TEXT;
BEGIN
  SELECT * INTO schedule_record
  FROM public.schedules
  WHERE id = schedule_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  IF NOT schedule_record.is_recurring THEN
    RETURN;
  END IF;

  end_date := COALESCE(schedule_record.recurring_end_date, from_date + days_ahead);
  recurrence_rule := schedule_record.recurrence_rule;

  -- Simple weekly recurrence implementation
  IF recurrence_rule LIKE 'FREQ=WEEKLY%' THEN
    -- Get the start date from the schedule
    instance_date := schedule_record.start_time::DATE;

    WHILE instance_date <= end_date LOOP
      IF instance_date >= from_date THEN
        RETURN NEXT (
          gen_random_uuid(),
          schedule_id,
          instance_date,
          schedule_record.start_time,
          schedule_record.end_time,
          schedule_record.location,
          FALSE,
          NULL,
          NOW()
        );
      END IF;
      instance_date := instance_date + INTERVAL '1 week';
    END LOOP;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at
  BEFORE UPDATE ON public.schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at
  BEFORE UPDATE ON public.assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exams_updated_at
  BEFORE UPDATE ON public.exams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_billing_subscriptions_updated_at
  BEFORE UPDATE ON public.billing_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- SEED DATA
-- =====================================================

-- Insert default departments
INSERT INTO public.departments (id, name, code) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Computer Science', 'CS'),
  ('00000000-0000-0000-0000-000000000002', 'Mathematics', 'MATH'),
  ('00000000-0000-0000-0000-000000000003', 'Physics', 'PHYS'),
  ('00000000-0000-0000-0000-000000000004', 'Engineering', 'ENGR'),
  ('00000000-0000-0000-0000-000000000005', 'Business', 'BUS'),
  ('00000000-0000-0000-0000-000000000006', 'Arts & Humanities', 'ARTS'),
  ('00000000-0000-0000-0000-000000000007', 'Social Sciences', 'SOC'),
  ('00000000-0000-0000-0000-000000000008', 'Languages', 'LANG')
ON CONFLICT (code) DO NOTHING;

-- Insert feature access for subscription plans
INSERT INTO public.feature_access (plan_id, feature, is_enabled, limits) VALUES
  -- Free plan
  ('free', 'unlimited_courses', FALSE, '{"max_courses": 5}'),
  ('free', 'unlimited_notifications', FALSE, '{"max_notifications_per_month": 500}'),
  ('free', 'push_notifications', FALSE, '{}'),
  ('free', 'email_notifications', TRUE, '{}'),
  ('free', 'ai_scheduler', FALSE, '{}'),
  ('free', 'advanced_analytics', FALSE, '{}'),
  -- Pro plan
  ('pro', 'unlimited_courses', TRUE, '{}'),
  ('pro', 'unlimited_notifications', TRUE, '{}'),
  ('pro', 'push_notifications', TRUE, '{}'),
  ('pro', 'email_notifications', TRUE, '{}'),
  ('pro', 'ai_scheduler', TRUE, '{"max_suggestions_per_month": 100}'),
  ('pro', 'advanced_analytics', TRUE, '{}'),
  -- Enterprise plan
  ('enterprise', 'unlimited_courses', TRUE, '{}'),
  ('enterprise', 'unlimited_notifications', TRUE, '{}'),
  ('enterprise', 'push_notifications', TRUE, '{}'),
  ('enterprise', 'email_notifications', TRUE, '{}'),
  ('enterprise', 'ai_scheduler', TRUE, '{"max_suggestions_per_month": -1}'),
  ('enterprise', 'advanced_analytics', TRUE, '{}'),
  ('enterprise', 'priority_support', TRUE, '{}'),
  ('enterprise', 'custom_branding', TRUE, '{}')
ON CONFLICT (plan_id, feature) DO NOTHING;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE public.users IS 'Extended user profile data. Links to auth.users via id.';
COMMENT ON COLUMN public.users.role IS 'User role: student, lecturer, or admin';
COMMENT ON COLUMN public.users.department IS 'Reference to departments table';

COMMENT ON TABLE public.courses IS 'Academic courses offered by the institution';
COMMENT ON COLUMN public.courses.course_code IS 'Unique course code (e.g., CS101)';
COMMENT ON COLUMN public.courses.enrolled_count IS 'Current number of enrolled students';

COMMENT ON TABLE public.schedules IS 'Class sessions, lectures, exams, assignments';
COMMENT ON COLUMN public.schedules.schedule_type IS 'Type of scheduled event';
COMMENT ON COLUMN public.schedules.is_recurring IS 'Whether this schedule repeats';
COMMENT ON COLUMN public.schedules.recurrence_rule IS 'RRULE format for recurrence';

COMMENT ON TABLE public.announcements IS 'System-wide announcements and notifications';
COMMENT ON COLUMN public.announcements.target_roles IS 'Array of roles that should receive this announcement';
COMMENT ON COLUMN public.announcements.target_courses IS 'Array of specific course IDs, NULL means all courses';

COMMENT ON TABLE public.notifications IS 'User-specific in-app notifications';
COMMENT ON COLUMN public.notifications.data IS 'JSON payload with additional context';

COMMENT ON TABLE public.billing_subscriptions IS 'User subscription and payment plans';
COMMENT ON COLUMN public.billing_subscriptions.provider IS 'Payment provider: paystack or paypal';
COMMENT ON COLUMN public.billing_subscriptions.status IS 'Subscription status from provider';

-- Schedule instances policies (same as schedules)
CREATE POLICY "Schedule instances visible like schedules" ON public.schedule_instances
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.schedules s
      JOIN public.courses c ON c.id = s.course_id
      JOIN public.enrollments e ON e.course_id = c.id
      WHERE s.id = schedule_instances.schedule_id
        AND e.student_id = auth.uid()
        AND e.status = 'active'
    )
    OR EXISTS (
      SELECT 1 FROM public.schedules s
      WHERE s.id = schedule_instances.schedule_id
        AND s.lecturer_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
