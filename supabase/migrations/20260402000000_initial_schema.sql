-- Acadion Initial Schema
-- Creates core tables with RLS policies and permissions

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum types
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM ('student', 'lecturer', 'admin', 'dean');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enrollment_status') THEN
    CREATE TYPE public.enrollment_status AS ENUM ('active', 'dropped', 'completed');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'announcement_category') THEN
    CREATE TYPE public.announcement_category AS ENUM (
      'general','academic','event','emergency','billing','maintenance'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'priority_level') THEN
    CREATE TYPE public.priority_level AS ENUM ('low','normal','high','urgent');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
    CREATE TYPE public.notification_type AS ENUM (
      'announcement','schedule_reminder','schedule_change','grade_posted',
      'assignment_due','payment_reminder','general'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'grade_scale') THEN
    CREATE TYPE public.grade_scale AS ENUM ('A','B','C','D','F','P');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attendance_status') THEN
    CREATE TYPE public.attendance_status AS ENUM ('present','absent','late','excused');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'schedule_type') THEN
    CREATE TYPE public.schedule_type AS ENUM ('class','exam','office_hours','other');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_category') THEN
    CREATE TYPE public.event_category AS ENUM ('academic','social','sports','career','other');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'provider_type') THEN
    CREATE TYPE public.provider_type AS ENUM ('paystack','paypal');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
    CREATE TYPE public.subscription_status AS ENUM (
      'active','canceled','past_due','unpaid','trialing'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE public.payment_status AS ENUM ('pending','completed','failed','refunded');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'feature_name') THEN
    CREATE TYPE public.feature_name AS ENUM (
      'unlimited_courses','unlimited_notifications','push_notifications',
      'email_notifications','ai_scheduler','advanced_analytics',
      'priority_support','custom_branding'
    );
  END IF;
END $$;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS public.ai_summaries CASCADE;
DROP TABLE IF EXISTS public.videos CASCADE;
DROP TABLE IF EXISTS public.grades CASCADE;
DROP TABLE IF EXISTS public.exams CASCADE;
DROP TABLE IF EXISTS public.assignments CASCADE;
DROP TABLE IF EXISTS public.billing_subscriptions CASCADE;
DROP TABLE IF EXISTS public.feature_access CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.schedule_instances CASCADE;
DROP TABLE IF EXISTS public.schedules CASCADE;
DROP TABLE IF EXISTS public.enrollments CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.announcements CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.departments CASCADE;

-- Departments
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (no FK to auth.users - accepts Firebase UID directly)
CREATE TABLE public.users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  department UUID REFERENCES departments(id) ON DELETE SET NULL,
  student_id VARCHAR(100) UNIQUE,
  employee_id VARCHAR(100) UNIQUE,
  avatar_url TEXT,
  phone VARCHAR(50),
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
  lecturer_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  capacity INTEGER DEFAULT 30,
  enrolled_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assignments (needed by grades)
CREATE TABLE public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  max_points DECIMAL(5,2) DEFAULT 100,
  weight DECIMAL(3,2) DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exams (needed by grades)
CREATE TABLE public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  exam_date TIMESTAMPTZ,
  duration_minutes INTEGER,
  max_points DECIMAL(5,2) DEFAULT 100,
  weight DECIMAL(3,2) DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enrollments
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  status enrollment_status DEFAULT 'active',
  UNIQUE(student_id, course_id)
);

-- Schedules
CREATE TABLE public.schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  lecturer_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  schedule_type schedule_type NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location VARCHAR(500),
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_rule TEXT,
  recurring_end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schedule instances
CREATE TABLE public.schedule_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
  instance_date DATE NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location VARCHAR(500),
  is_cancelled BOOLEAN DEFAULT FALSE,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
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
  author_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  is_published BOOLEAN DEFAULT TRUE,
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title VARCHAR(500) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
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
  organizer_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT TRUE,
  max_participants INTEGER,
  registration_required BOOLEAN DEFAULT FALSE,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grades (after assignments & exams)
CREATE TABLE public.grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES assignments(id) ON DELETE SET NULL,
  exam_id UUID REFERENCES exams(id) ON DELETE SET NULL,
  points_earned DECIMAL(5,2),
  percentage DECIMAL(5,2),
  grade_letter grade_scale,
  feedback TEXT,
  graded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Billing subscriptions
CREATE TABLE public.billing_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  plan_id VARCHAR(100) NOT NULL,
  provider provider_type NOT NULL,
  provider_subscription_id TEXT NOT NULL,
  status subscription_status DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feature access (paywall configuration)
CREATE TABLE public.feature_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id VARCHAR(100) NOT NULL,
  feature feature_name NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  limits JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(plan_id, feature)
);

-- AI scheduler suggestions
CREATE TABLE public.ai_scheduler_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  suggested_start_time TIMESTAMPTZ NOT NULL,
  suggested_end_time TIMESTAMPTZ NOT NULL,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  reasoning TEXT,
  is_accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

-- Videos
CREATE TABLE public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  video_type VARCHAR(50) DEFAULT 'youtube',
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  ai_summary TEXT,
  ai_key_points TEXT[] DEFAULT '{}',
  view_count INTEGER DEFAULT 0,
  semester VARCHAR(50),
  academic_year VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI summaries
CREATE TABLE public.ai_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  key_points TEXT[] DEFAULT '{}',
  tokens_used INTEGER,
  model_used VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_department ON public.users(department);
CREATE INDEX IF NOT EXISTS idx_courses_department ON public.courses(department_id);
CREATE INDEX IF NOT EXISTS idx_courses_lecturer ON public.courses(lecturer_id);
CREATE INDEX IF NOT EXISTS idx_courses_active ON public.courses(is_active);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON public.enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_schedules_course ON public.schedules(course_id);
CREATE INDEX IF NOT EXISTS idx_schedules_lecturer ON public.schedules(lecturer_id);
CREATE INDEX IF NOT EXISTS idx_videos_course ON public.videos(course_id);
CREATE INDEX IF NOT EXISTS idx_grades_student ON public.grades(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);

-- Events indexes
CREATE INDEX IF NOT EXISTS idx_events_organizer ON public.events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_dates ON public.events(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_subscription ON public.payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_created ON public.payments(created_at DESC);

-- AI scheduler suggestions indexes
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_user ON public.ai_scheduler_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_course ON public.ai_scheduler_suggestions(course_id);

-- Trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers (safe creation)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
    CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_courses_updated_at') THEN
    CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_schedules_updated_at') THEN
    CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON public.schedules
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_videos_updated_at') THEN
    CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON public.videos
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- =====================================================
-- PERMISSIONS: GRANT SCHEMA AND TABLE ACCESS
-- =====================================================

-- Grant usage on schema to anon and authenticated roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions on all tables to anon and authenticated
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated;

-- Grant usage on sequences (for auto-increment IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

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
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid()::text = id);

CREATE POLICY "Users can insert own data" ON public.users
  FOR INSERT WITH CHECK (auth.uid()::text = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()::text AND role = 'admin'
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
      WHERE student_id = auth.uid()::text
      AND course_id = public.courses.id
      AND status = 'active'
    )
  );

CREATE POLICY "Lecturers can view their courses" ON public.courses
  FOR SELECT USING (lecturer_id = auth.uid()::text);

CREATE POLICY "Admins can view all courses" ON public.courses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

CREATE POLICY "Admins and lecturers can insert courses" ON public.courses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()::text AND role IN ('admin', 'lecturer')
    )
  );

CREATE POLICY "Course owners can update" ON public.courses
  FOR UPDATE USING (lecturer_id = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

-- Enrollments policies
CREATE POLICY "Students can view own enrollments" ON public.enrollments
  FOR SELECT USING (student_id = auth.uid()::text);

CREATE POLICY "Lecturers can view enrollments for their courses" ON public.enrollments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = enrollments.course_id
      AND courses.lecturer_id = auth.uid()::text
    )
  );

CREATE POLICY "Admins can view all enrollments" ON public.enrollments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

CREATE POLICY "Students can enroll in courses" ON public.enrollments
  FOR INSERT WITH CHECK (student_id = auth.uid()::text);

CREATE POLICY "Students can drop courses" ON public.enrollments
  FOR UPDATE USING (student_id = auth.uid()::text);

-- Schedules policies
CREATE POLICY "Schedules are visible to enrolled users" ON public.schedules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      JOIN public.enrollments e ON e.course_id = c.id
      WHERE c.id = schedules.course_id
      AND e.student_id = auth.uid()::text
      AND e.status = 'active'
    )
    OR schedules.lecturer_id = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

CREATE POLICY "Lecturers can manage their schedules" ON public.schedules
  FOR ALL USING (
    lecturer_id = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

-- Announcements policies
CREATE POLICY "Published announcements visible to target roles" ON public.announcements
  FOR SELECT USING (
    is_published = TRUE
    AND (target_roles @> ARRAY[
      (SELECT role FROM public.users WHERE id = auth.uid()::text)
    ]::user_role[])
    AND (target_courses IS NULL OR target_courses @> (
      SELECT ARRAY_AGG(course_id)
      FROM public.enrollments
      WHERE student_id = auth.uid()::text AND status = 'active'
    ))
  );

CREATE POLICY "Authors can manage their announcements" ON public.announcements
  FOR ALL USING (author_id = auth.uid()::text);

CREATE POLICY "Admins can manage all announcements" ON public.announcements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (
    auth.uid() IS NULL OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()::text AND role IN ('admin', 'lecturer')
    )
  );

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid()::text);

-- Events policies
CREATE POLICY "Public events visible to all" ON public.events
  FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Organizers can manage their events" ON public.events
  FOR ALL USING (organizer_id = auth.uid()::text);

CREATE POLICY "Admins can manage all events" ON public.events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

-- Exams policies
CREATE POLICY "Exams visible to enrolled students and lecturers" ON public.exams
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      JOIN public.enrollments e ON e.course_id = c.id
      WHERE c.id = exams.course_id
      AND e.student_id = auth.uid()::text
      AND e.status = 'active'
    )
    OR EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = exams.course_id
      AND courses.lecturer_id = auth.uid()::text
    )
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

CREATE POLICY "Lecturers can manage exams for their courses" ON public.exams
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = exams.course_id
      AND courses.lecturer_id = auth.uid()::text
    )
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

-- Assignments policies
CREATE POLICY "Assignments visible to enrolled students and lecturers" ON public.assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      JOIN public.enrollments e ON e.course_id = c.id
      WHERE c.id = assignments.course_id
      AND e.student_id = auth.uid()::text
      AND e.status = 'active'
    )
    OR EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = assignments.course_id
      AND courses.lecturer_id = auth.uid()::text
    )
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

CREATE POLICY "Lecturers can manage assignments" ON public.assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = assignments.course_id
      AND courses.lecturer_id = auth.uid()::text
    )
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

-- Grades policies
CREATE POLICY "Students can view own grades" ON public.grades
  FOR SELECT USING (student_id = auth.uid()::text);

CREATE POLICY "Lecturers can view grades for their courses" ON public.grades
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.assignments a
      JOIN public.courses c ON c.id = a.course_id
      WHERE a.id = grades.assignment_id
      AND c.lecturer_id = auth.uid()::text
    )
    OR EXISTS (
      SELECT 1 FROM public.exams e
      JOIN public.courses c ON c.id = e.course_id
      WHERE e.id = grades.exam_id
      AND c.lecturer_id = auth.uid()::text
    )
  );

CREATE POLICY "Lecturers can insert/update grades" ON public.grades
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.assignments a
      JOIN public.courses c ON c.id = a.course_id
      WHERE a.id = grades.assignment_id
      AND c.lecturer_id = auth.uid()::text
    )
    OR EXISTS (
      SELECT 1 FROM public.exams e
      JOIN public.courses c ON c.id = e.course_id
      WHERE e.id = grades.exam_id
      AND c.lecturer_id = auth.uid()::text
    )
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

-- Billing subscriptions policies
CREATE POLICY "Users can view own subscription" ON public.billing_subscriptions
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Service role can manage subscriptions" ON public.billing_subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- Payments policies
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Service role can manage payments" ON public.payments
  FOR ALL USING (auth.role() = 'service_role');

-- Feature access policies
CREATE POLICY "Feature access readable by authenticated" ON public.feature_access
  FOR SELECT USING (auth.role() = 'authenticated');

-- AI scheduler suggestions policies
CREATE POLICY "Users can view own suggestions" ON public.ai_scheduler_suggestions
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own suggestions" ON public.ai_scheduler_suggestions
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own suggestions" ON public.ai_scheduler_suggestions
  FOR UPDATE USING (user_id = auth.uid()::text);

-- Schedule instances policies
CREATE POLICY "Schedule instances visible like schedules" ON public.schedule_instances
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.schedules s
      JOIN public.courses c ON c.id = s.course_id
      JOIN public.enrollments e ON e.course_id = c.id
      WHERE s.id = schedule_instances.schedule_id
        AND e.student_id = auth.uid()::text
        AND e.status = 'active'
    )
    OR EXISTS (
      SELECT 1 FROM public.schedules s
      WHERE s.id = schedule_instances.schedule_id
        AND s.lecturer_id = auth.uid()::text
    )
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  );
