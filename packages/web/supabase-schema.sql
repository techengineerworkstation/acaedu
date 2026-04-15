-- =====================================================
-- ACAEDU DATABASE SCHEMA SETUP (Fixed)
-- Run these queries in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. USER NOTIFICATIONS TABLE
-- =====================================================
DROP TABLE IF EXISTS public.notifications CASCADE;

CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,  -- Changed to TEXT to match auth.users.id
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'general',
  is_read BOOLEAN DEFAULT false,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notIFICATIONS_created_at ON public.notifications(created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid()::text = user_id);

-- =====================================================
-- 2. INSTITUTION SETTINGS TABLE
-- =====================================================
DROP TABLE IF EXISTS public.institution_settings CASCADE;

CREATE TABLE public.institution_settings (
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

INSERT INTO public.institution_settings (institution_name, theme_preset)
VALUES ('Acaedu', 'blue')
ON CONFLICT DO NOTHING;

ALTER TABLE public.institution_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view settings" ON public.institution_settings FOR SELECT USING (true);

-- =====================================================
-- 3. USER PROFILES TABLE
-- =====================================================
DROP TABLE IF EXISTS public.user_profiles CASCADE;

CREATE TABLE public.user_profiles (
  id TEXT PRIMARY KEY,  -- TEXT to match auth.users.id
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'student',
  department_id TEXT,
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

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profiles" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid()::text = id);

-- =====================================================
-- 4. AUTO-CREATE PROFILE TRIGGER
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id::text,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 5. CHAT MESSAGES TABLE (Discussion)
-- =====================================================
DROP TABLE IF EXISTS public.chat_messages CASCADE;

CREATE TABLE public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  course_id TEXT,
  message TEXT NOT NULL,
  parent_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_course ON public.chat_messages(course_id);
CREATE INDEX idx_chat_messages_user ON public.chat_messages(user_id);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can chat" ON public.chat_messages
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert messages" ON public.chat_messages
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- =====================================================
-- 6. DEPARTMENTS TABLE
-- =====================================================
DROP TABLE IF EXISTS public.departments CASCADE;

CREATE TABLE public.departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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
DROP TABLE IF EXISTS public.courses CASCADE;

CREATE TABLE public.courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  department_id TEXT,  -- TEXT to match departments.id
  lecturer_id TEXT,  -- TEXT to match auth.users.id
  credits INTEGER DEFAULT 3,
  semester INTEGER DEFAULT 1,
  year INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_courses_department ON public.courses(department_id);
CREATE INDEX idx_courses_lecturer ON public.courses(lecturer_id);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view courses" ON public.courses FOR SELECT USING (true);

-- =====================================================
-- 8. ENROLLMENTS TABLE
-- =====================================================
DROP TABLE IF EXISTS public.enrollments CASCADE;

CREATE TABLE public.enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,  -- TEXT to match auth.users.id
  course_id TEXT,  -- TEXT to match courses.id
  status TEXT DEFAULT 'active',
  enrolled_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view enrollments" ON public.enrollments
  FOR SELECT USING (auth.uid()::text = user_id);

-- =====================================================
-- 9. USERS TABLE (for user management)
-- =====================================================
DROP TABLE IF EXISTS public.users CASCADE;

CREATE TABLE public.users (
  id TEXT PRIMARY KEY,  -- TEXT to match auth.users.id
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT DEFAULT 'student',
  department TEXT,
  department_id TEXT,
  avatar_url TEXT,
  student_id TEXT,
  employee_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_department ON public.users(department);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own" ON public.users
  FOR UPDATE USING (auth.uid()::text = id);

-- =====================================================
-- 10. AUTO-CREATE USER RECORD TRIGGER
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_user_created()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, department)
  VALUES (
    NEW.id::text,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    NEW.raw_user_meta_data->>'department'
  )
  ON CONFLICT (email) DO UPDATE
  SET full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
      role = COALESCE(NEW.raw_user_meta_data->>'role', 'student');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_created ON auth.users;
CREATE TRIGGER on_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_created();

-- =====================================================
-- VERIFY SETUP
-- =====================================================
SELECT 
  'notifications' as table_name,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'notifications') as exists
UNION ALL
SELECT 
  'institution_settings',
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'institution_settings')
UNION ALL
SELECT 
  'departments',
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'departments')
UNION ALL
SELECT 
  'courses',
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'courses')
UNION ALL
SELECT 
  'enrollments',
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'enrollments')
UNION ALL
SELECT 
  'users',
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'users');