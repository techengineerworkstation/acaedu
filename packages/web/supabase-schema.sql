-- =====================================================
-- ACAEDU DATABASE SCHEMA SETUP
-- Run these queries in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. USER NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'general' CHECK (type IN ('announcement', 'schedule_reminder', 'schedule_change', 'grade_posted', 'assignment_due', 'payment_reminder', 'system_maintenance', 'exam_reminder', 'message')),
  is_read BOOLEAN DEFAULT false,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read) WHERE NOT is_read;

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update own notifications
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- 2. INSTITUTION SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.institution_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_name TEXT DEFAULT 'Acaedu',
  motto TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  primary_color TEXT DEFAULT '#3b82f6',
  secondary_color TEXT DEFAULT '#8b5cf6',
  accent_color TEXT DEFAULT '#06b6d4',
  background_color TEXT DEFAULT '#ffffff',
  surface_color TEXT DEFAULT '#f3f4f6',
  text_primary_color TEXT DEFAULT '#1f2937',
  text_secondary_color TEXT DEFAULT '#6b7280',
  theme_preset TEXT DEFAULT 'blue',
  website_url TEXT,
  support_email TEXT,
  contact_phone TEXT,
  address TEXT,
  facebook_url TEXT,
  twitter_url TEXT,
  instagram_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO public.institution_settings (institution_name, theme_preset)
VALUES ('Acaedu', 'blue')
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE public.institution_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings
CREATE POLICY "Anyone can view settings" ON public.institution_settings
  FOR SELECT USING (true);

-- Only admins can update
CREATE POLICY "Admins can update settings" ON public.institution_settings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
  );

-- =====================================================
-- 3. USER PROFILES TABLE (extends auth.users)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'student',
  department_id UUID,
  department_name TEXT,
  avatar_url TEXT,
  student_id TEXT,
  employee_id TEXT,
  year INTEGER,
  semester INTEGER,
  phone TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(email)
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read all profiles
CREATE POLICY "Anyone can view profiles" ON public.user_profiles
  FOR SELECT USING (true);

-- Users can update own profile
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- =====================================================
-- 4. AUTO-CREATE PROFILE TRIGGER
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 5. CHAT MESSAGES TABLE (for Discussion feature)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID,
  message TEXT NOT NULL,
  parent_id UUID REFERENCES public.chat_messages(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_course ON public.chat_messages(course_id);
CREATE INDEX idx_chat_messages_user ON public.chat_messages(user_id);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can chat" ON public.chat_messages
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert messages" ON public.chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 6. DEPARTMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert sample departments
INSERT INTO public.departments (name, code, description) VALUES
  ('Computer Science', 'CS', 'Computer Science and IT'),
  ('Mathematics', 'MATH', 'Mathematics and Statistics'),
  ('Physics', 'PHY', 'Physics and Applied Physics'),
  ('Chemistry', 'CHEM', 'Chemistry and Biochemistry'),
  ('Biology', 'BIO', 'Biology and Life Sciences'),
  ('Engineering', 'ENG', 'Engineering disciplines'),
  ('Business Administration', 'BUS', 'Business and Management'),
  ('Economics', 'ECON', 'Economics and Finance')
ON CONFLICT (code) DO NOTHING;

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view departments" ON public.departments FOR SELECT USING (true);

-- =====================================================
-- 7. COURSES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  department_id UUID REFERENCES public.departments(id),
  lecturer_id UUID REFERENCES auth.users(id),
  credits INTEGER DEFAULT 3,
  semester INTEGER DEFAULT 1,
  year INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_courses_department ON public.courses(department_id);
CREATE INDEX idx_courses_lecturer ON public.courses(lecturer_id);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Admins can manage courses" ON public.courses FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
);

-- =====================================================
-- 8. ENROLLMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active',
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view enrollments" ON public.enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage enrollments" ON public.enrollments FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
);