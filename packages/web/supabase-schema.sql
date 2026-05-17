-- =====================================================
-- ACAEDU DATABASE SCHEMA - SECURITY HARDENED
-- Run these queries in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. USER NOTIFICATIONS TABLE
-- =====================================================
DROP TABLE IF EXISTS public.notifications CASCADE;

CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'general',
  is_read BOOLEAN DEFAULT false,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- SECURITY: Users can only read their own notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid()::text = user_id);

-- SECURITY: Users can only insert their own notifications (via trigger/API)
DROP POLICY IF EXISTS "Users can insert notifications" ON public.notifications;
CREATE POLICY "Users can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- SECURITY: Users can only update their own notifications
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid()::text = user_id);

-- SECURITY: Users can only delete their own notifications
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications" ON public.notifications
  FOR DELETE USING (auth.uid()::text = user_id);

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

-- SECURITY: Anyone can view settings (public info)
DROP POLICY IF EXISTS "Anyone can view settings" ON public.institution_settings;
CREATE POLICY "Anyone can view settings" ON public.institution_settings FOR SELECT USING (true);

-- SECURITY: Only authenticated admins can update settings
DROP POLICY IF EXISTS "Admins can update settings" ON public.institution_settings;
CREATE POLICY "Admins can update settings" ON public.institution_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()::text
      AND users.role = 'admin'
    )
  );

-- =====================================================
-- 3. USER PROFILES TABLE
-- =====================================================
DROP TABLE IF EXISTS public.user_profiles CASCADE;

CREATE TABLE public.user_profiles (
  id TEXT PRIMARY KEY,
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

-- SECURITY: Anyone can view profiles (public directory)
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.user_profiles;
CREATE POLICY "Anyone can view profiles" ON public.user_profiles FOR SELECT USING (true);

-- SECURITY: Users can update only their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid()::text = id);

-- SECURITY: Prevent INSERT by users (only trigger can insert)
DROP POLICY IF EXISTS "Trigger can insert profiles" ON public.user_profiles;
CREATE POLICY "Trigger can insert profiles" ON public.user_profiles
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- 4. AUTO-CREATE PROFILE TRIGGER (SECURE)
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id::text,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(LOWER(NEW.raw_user_meta_data->>'role'), 'student')
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

-- SECURITY: Authenticated users can read chat messages
DROP POLICY IF EXISTS "Authenticated users can read chat" ON public.chat_messages;
CREATE POLICY "Authenticated users can read chat" ON public.chat_messages
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- SECURITY: Users can only insert their own messages
DROP POLICY IF EXISTS "Users can insert messages" ON public.chat_messages;
CREATE POLICY "Users can insert messages" ON public.chat_messages
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- SECURITY: Users can only delete their own messages
DROP POLICY IF EXISTS "Users can delete own messages" ON public.chat_messages;
CREATE POLICY "Users can delete own messages" ON public.chat_messages
  FOR DELETE USING (auth.uid()::text = user_id);

-- SECURITY: Users can only update their own messages
DROP POLICY IF EXISTS "Users can update own messages" ON public.chat_messages;
CREATE POLICY "Users can update own messages" ON public.chat_messages
  FOR UPDATE USING (auth.uid()::text = user_id);

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

-- SECURITY: Anyone can view departments
DROP POLICY IF EXISTS "Anyone can view departments" ON public.departments;
CREATE POLICY "Anyone can view departments" ON public.departments FOR SELECT USING (true);

-- SECURITY: Only admins can modify departments
DROP POLICY IF EXISTS "Admins can manage departments" ON public.departments;
CREATE POLICY "Admins can manage departments" ON public.departments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()::text
      AND users.role = 'admin'
    )
  );

-- =====================================================
-- 7. COURSES TABLE
-- =====================================================
DROP TABLE IF EXISTS public.courses CASCADE;

CREATE TABLE public.courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  summary TEXT,
  color TEXT DEFAULT '#0ea5e9',
  department_id TEXT,
  lecturer_id TEXT,
  credits INTEGER DEFAULT 3,
  semester INTEGER DEFAULT 1,
  year INTEGER DEFAULT 1,
  capacity INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_courses_department ON public.courses(department_id);
CREATE INDEX idx_courses_lecturer ON public.courses(lecturer_id);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- SECURITY: Anyone can view active courses
DROP POLICY IF EXISTS "Anyone can view courses" ON public.courses;
CREATE POLICY "Anyone can view courses" ON public.courses FOR SELECT USING (is_active = true);

-- SECURITY: Only admins can insert/update/delete courses
DROP POLICY IF EXISTS "Admins can manage courses" ON public.courses;
CREATE POLICY "Admins can manage courses" ON public.courses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()::text
      AND users.role IN ('admin', 'lecturer')
    )
  );

-- =====================================================
-- 8. ENROLLMENTS TABLE
-- =====================================================
DROP TABLE IF EXISTS public.enrollments CASCADE;

CREATE TABLE public.enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  enrolled_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_enrollments_user ON public.enrollments(user_id);
CREATE INDEX idx_enrollments_course ON public.enrollments(course_id);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- SECURITY: Users can view their own enrollments
DROP POLICY IF EXISTS "Users can view own enrollments" ON public.enrollments;
CREATE POLICY "Users can view own enrollments" ON public.enrollments
  FOR SELECT USING (auth.uid()::text = user_id);

-- SECURITY: Users can only insert their own enrollments
DROP POLICY IF EXISTS "Users can create enrollments" ON public.enrollments;
CREATE POLICY "Users can create enrollments" ON public.enrollments
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- SECURITY: Users can only delete their own enrollments
DROP POLICY IF EXISTS "Users can delete own enrollments" ON public.enrollments;
CREATE POLICY "Users can delete own enrollments" ON public.enrollments
  FOR DELETE USING (auth.uid()::text = user_id);

-- SECURITY: Admins can view all enrollments
DROP POLICY IF EXISTS "Admins can view all enrollments" ON public.enrollments;
CREATE POLICY "Admins can view all enrollments" ON public.enrollments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()::text
      AND users.role = 'admin'
    )
  );

-- =====================================================
-- 9. USERS TABLE (for user management)
-- =====================================================
DROP TABLE IF EXISTS public.users CASCADE;

CREATE TABLE public.users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT DEFAULT 'student',
  department TEXT,
  department_id TEXT,
  avatar_url TEXT,
  student_id TEXT,
  employee_id TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_department ON public.users(department);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- SECURITY: Anyone can view active users (public directory)
DROP POLICY IF EXISTS "Anyone can view users" ON public.users;
CREATE POLICY "Anyone can view users" ON public.users FOR SELECT USING (is_active = true);

-- SECURITY: Users can update only their own record
DROP POLICY IF EXISTS "Users can update own" ON public.users;
CREATE POLICY "Users can update own" ON public.users
  FOR UPDATE USING (auth.uid()::text = id);

-- SECURITY: Only admins can insert users
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
CREATE POLICY "Admins can insert users" ON public.users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()::text
      AND u.role = 'admin'
    )
  );

-- SECURITY: Only admins can delete users
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;
CREATE POLICY "Admins can delete users" ON public.users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()::text
      AND u.role = 'admin'
    )
  );

-- =====================================================
-- 10. AUTO-CREATE USER RECORD TRIGGER (SECURE)
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_user_created()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, department)
  VALUES (
    NEW.id::text,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(LOWER(NEW.raw_user_meta_data->>'role'), 'student'),
    NEW.raw_user_meta_data->>'department'
  )
  ON CONFLICT (email) DO UPDATE
  SET full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
      role = COALESCE(LOWER(NEW.raw_user_meta_data->>'role'), 'student');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_created ON auth.users;
CREATE TRIGGER on_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_created();

-- =====================================================
-- 11. MATERIALS TABLE (New)
-- =====================================================
DROP TABLE IF EXISTS public.materials CASCADE;

CREATE TABLE public.materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  course_id TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  file_url TEXT,
  file_type TEXT,
  file_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_materials_course ON public.materials(course_id);
CREATE INDEX idx_materials_uploader ON public.materials(uploaded_by);

ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

-- SECURITY: Authenticated users can view materials
DROP POLICY IF EXISTS "Authenticated can view materials" ON public.materials;
CREATE POLICY "Authenticated can view materials" ON public.materials
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- SECURITY: Only lecturers/admins can upload materials
DROP POLICY IF EXISTS "Lecturers can upload materials" ON public.materials;
CREATE POLICY "Lecturers can upload materials" ON public.materials
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()::text
      AND users.role IN ('admin', 'lecturer')
    )
  );

-- SECURITY: Only uploaders can delete their materials
DROP POLICY IF EXISTS "Owners can delete materials" ON public.materials;
CREATE POLICY "Owners can delete materials" ON public.materials
  FOR DELETE USING (auth.uid()::text = uploaded_by);

-- =====================================================
-- 12. ASSIGNMENTS TABLE (New)
-- =====================================================
DROP TABLE IF EXISTS public.assignments CASCADE;

CREATE TABLE public.assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  course_id TEXT NOT NULL,
  created_by TEXT NOT NULL,
  due_date TIMESTAMPTZ,
  max_score INTEGER DEFAULT 100,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assignments_course ON public.assignments(course_id);
CREATE INDEX idx_assignments_due ON public.assignments(due_date);

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- SECURITY: Authenticated users can view assignments
DROP POLICY IF EXISTS "Authenticated can view assignments" ON public.assignments;
CREATE POLICY "Authenticated can view assignments" ON public.assignments
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- SECURITY: Only lecturers/admins can create assignments
DROP POLICY IF EXISTS "Lecturers can create assignments" ON public.assignments;
CREATE POLICY "Lecturers can create assignments" ON public.assignments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()::text
      AND users.role IN ('admin', 'lecturer')
    )
  );

-- SECURITY: Only creators can update/delete
DROP POLICY IF EXISTS "Creators can manage assignments" ON public.assignments;
CREATE POLICY "Creators can manage assignments" ON public.assignments
  FOR ALL USING (auth.uid()::text = created_by);

-- =====================================================
-- 13. EXAMS TABLE (New)
-- =====================================================
DROP TABLE IF EXISTS public.exams CASCADE;

CREATE TABLE public.exams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  course_id TEXT NOT NULL,
  created_by TEXT NOT NULL,
  exam_date TIMESTAMPTZ,
  duration_minutes INTEGER DEFAULT 60,
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_exams_course ON public.exams(course_id);
CREATE INDEX idx_exams_date ON public.exams(exam_date);

ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

-- SECURITY: Authenticated users can view exams
DROP POLICY IF EXISTS "Authenticated can view exams" ON public.exams;
CREATE POLICY "Authenticated can view exams" ON public.exams
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- SECURITY: Only lecturers/admins can create exams
DROP POLICY IF EXISTS "Lecturers can create exams" ON public.exams;
CREATE POLICY "Lecturers can create exams" ON public.exams
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()::text
      AND users.role IN ('admin', 'lecturer')
    )
  );

-- SECURITY: Only creators can update/delete
DROP POLICY IF EXISTS "Creators can manage exams" ON public.exams;
CREATE POLICY "Creators can manage exams" ON public.exams
  FOR ALL USING (auth.uid()::text = created_by);

-- =====================================================
-- 14. GRADES TABLE (New)
-- =====================================================
DROP TABLE IF EXISTS public.grades CASCADE;

CREATE TABLE public.grades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id TEXT NOT NULL,
  assignment_id TEXT,
  exam_id TEXT,
  score INTEGER,
  feedback TEXT,
  graded_by TEXT,
  graded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_grades_student ON public.grades(student_id);
CREATE INDEX idx_grades_assignment ON public.grades(assignment_id);
CREATE INDEX idx_grades_exam ON public.grades(exam_id);

ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

-- SECURITY: Users can view their own grades
DROP POLICY IF EXISTS "Users can view own grades" ON public.grades;
CREATE POLICY "Users can view own grades" ON public.grades
  FOR SELECT USING (auth.uid()::text = student_id);

-- SECURITY: Lecturers can view student grades for their courses
DROP POLICY IF EXISTS "Lecturers can view grades" ON public.grades;
CREATE POLICY "Lecturers can view grades" ON public.grades
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()::text
      AND users.role IN ('admin', 'lecturer')
    )
  );

-- SECURITY: Only lecturers can insert grades
DROP POLICY IF EXISTS "Lecturers can insert grades" ON public.grades;
CREATE POLICY "Lecturers can insert grades" ON public.grades
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()::text
      AND users.role IN ('admin', 'lecturer')
    )
  );

-- SECURITY: Only graders can update grades
DROP POLICY IF EXISTS "Graders can update grades" ON public.grades;
CREATE POLICY "Graders can update grades" ON public.grades
  FOR UPDATE USING (auth.uid()::text = graded_by);

-- =====================================================
-- 15. MEETINGS TABLE (New - Live Classes)
-- =====================================================
DROP TABLE IF EXISTS public.meetings CASCADE;

CREATE TABLE public.meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  course_id TEXT,
  host_id TEXT NOT NULL,
  meeting_url TEXT,
  scheduled_at TIMESTAMPTZ,
  duration_minutes INTEGER DEFAULT 60,
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_meetings_course ON public.meetings(course_id);
CREATE INDEX idx_meetings_host ON public.meetings(host_id);
CREATE INDEX idx_meetings_scheduled ON public.meetings(scheduled_at);

ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

-- SECURITY: Authenticated users can view meetings
DROP POLICY IF EXISTS "Authenticated can view meetings" ON public.meetings;
CREATE POLICY "Authenticated can view meetings" ON public.meetings
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- SECURITY: Only lecturers/admins can create meetings
DROP POLICY IF EXISTS "Lecturers can create meetings" ON public.meetings;
CREATE POLICY "Lecturers can create meetings" ON public.meetings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()::text
      AND users.role IN ('admin', 'lecturer')
    )
  );

-- SECURITY: Only hosts can update/delete their meetings
DROP POLICY IF EXISTS "Hosts can manage meetings" ON public.meetings;
CREATE POLICY "Hosts can manage meetings" ON public.meetings
  FOR ALL USING (auth.uid()::text = host_id);

-- =====================================================
-- 16. CLASS VENUES TABLE (New)
-- =====================================================
DROP TABLE IF EXISTS public.class_venues CASCADE;

CREATE TABLE public.class_venues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  building TEXT,
  capacity INTEGER DEFAULT 30,
  room_number TEXT,
  venue_type TEXT DEFAULT 'classroom',
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.class_venues ENABLE ROW LEVEL SECURITY;

-- SECURITY: Authenticated users can view venues
DROP POLICY IF EXISTS "Authenticated can view venues" ON public.class_venues;
CREATE POLICY "Authenticated can view venues" ON public.class_venues
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- SECURITY: Only admins can manage venues
DROP POLICY IF EXISTS "Admins can manage venues" ON public.class_venues;
CREATE POLICY "Admins can manage venues" ON public.class_venues
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()::text
      AND users.role = 'admin'
    )
  );

-- =====================================================
-- 17. SCHEDULES TABLE (New)
-- =====================================================
DROP TABLE IF EXISTS public.schedules CASCADE;

CREATE TABLE public.schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id TEXT NOT NULL,
  venue_id TEXT,
  day_of_week INTEGER NOT NULL,  -- 0-6 (Sunday-Saturday)
  start_time TEXT NOT NULL,  -- HH:MM format
  end_time TEXT NOT NULL,
  semester INTEGER DEFAULT 1,
  year INTEGER DEFAULT 2024,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_schedules_course ON public.schedules(course_id);
CREATE INDEX idx_schedules_venue ON public.schedules(venue_id);

ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- SECURITY: Authenticated users can view schedules
DROP POLICY IF EXISTS "Authenticated can view schedules" ON public.schedules;
CREATE POLICY "Authenticated can view schedules" ON public.schedules
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- SECURITY: Only admins/lecturers can manage schedules
DROP POLICY IF EXISTS "Staff can manage schedules" ON public.schedules;
CREATE POLICY "Staff can manage schedules" ON public.schedules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()::text
      AND users.role IN ('admin', 'lecturer')
    )
  );

-- =====================================================
-- 18. EVENTS TABLE (New)
-- =====================================================
DROP TABLE IF EXISTS public.events CASCADE;

CREATE TABLE public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT DEFAULT 'general',
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT,
  organizer_id TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_start ON public.events(start_date);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- SECURITY: Authenticated users can view published events
DROP POLICY IF EXISTS "Authenticated can view events" ON public.events;
CREATE POLICY "Authenticated can view events" ON public.events
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- SECURITY: Only admins can manage events
DROP POLICY IF EXISTS "Admins can manage events" ON public.events;
CREATE POLICY "Admins can manage events" ON public.events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()::text
      AND users.role = 'admin'
    )
  );

-- =====================================================
-- 19. ANNOUNCEMENTS TABLE (New)
-- =====================================================
DROP TABLE IF EXISTS public.announcements CASCADE;

CREATE TABLE public.announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id TEXT NOT NULL,
  target_roles TEXT[],  -- ['student', 'lecturer', 'admin']
  target_courses TEXT[],  -- course IDs
  is_published BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_announcements_published ON public.announcements(is_published);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- SECURITY: Authenticated users can view published announcements
DROP POLICY IF EXISTS "Authenticated can view announcements" ON public.announcements;
CREATE POLICY "Authenticated can view announcements" ON public.announcements
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- SECURITY: Only admins/lecturers can create announcements
DROP POLICY IF EXISTS "Staff can manage announcements" ON public.announcements;
CREATE POLICY "Staff can manage announcements" ON public.announcements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()::text
      AND users.role IN ('admin', 'lecturer')
    )
  );

-- =====================================================
-- 20. LECTURE VIDEOS TABLE (New)
-- =====================================================
DROP TABLE IF EXISTS public.lecture_videos CASCADE;

CREATE TABLE public.lecture_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  course_id TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER,  -- seconds
  week_number INTEGER,
  uploaded_by TEXT NOT NULL,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_videos_course ON public.lecture_videos(course_id);

ALTER TABLE public.lecture_videos ENABLE ROW LEVEL SECURITY;

-- SECURITY: Authenticated users can view published videos
DROP POLICY IF EXISTS "Authenticated can view videos" ON public.lecture_videos;
CREATE POLICY "Authenticated can view videos" ON public.lecture_videos
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- SECURITY: Only admins/lecturers can upload videos
DROP POLICY IF EXISTS "Staff can upload videos" ON public.lecture_videos;
CREATE POLICY "Staff can upload videos" ON public.lecture_videos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()::text
      AND users.role IN ('admin', 'lecturer')
    )
  );

-- =====================================================
-- 21. PAYMENTS TABLE (New)
-- =====================================================
DROP TABLE IF EXISTS public.payments CASCADE;

CREATE TABLE public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount INTEGER NOT NULL,  -- cents
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  reference TEXT UNIQUE,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

CREATE INDEX idx_payments_user ON public.payments(user_id);
CREATE INDEX idx_payments_reference ON public.payments(reference);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- SECURITY: Users can view their own payments
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (auth.uid()::text = user_id);

-- SECURITY: Only admins can view all payments
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;
CREATE POLICY "Admins can view all payments" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()::text
      AND users.role = 'admin'
    )
  );

-- =====================================================
-- 22. BILLING SUBSCRIPTIONS TABLE (New)
-- =====================================================
DROP TABLE IF EXISTS public.billing_subscriptions CASCADE;

CREATE TABLE public.billing_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  plan TEXT DEFAULT 'free',
  status TEXT DEFAULT 'active',
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON public.billing_subscriptions(user_id);

ALTER TABLE public.billing_subscriptions ENABLE ROW LEVEL SECURITY;

-- SECURITY: Users can view their own subscription
DROP POLICY IF EXISTS "Users can view own subscription" ON public.billing_subscriptions;
CREATE POLICY "Users can view own subscription" ON public.billing_subscriptions
  FOR SELECT USING (auth.uid()::text = user_id);

-- =====================================================
-- 23. COURSE OUTLINES TABLE (New)
-- =====================================================
DROP TABLE IF EXISTS public.course_outlines CASCADE;

CREATE TABLE public.course_outlines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id TEXT NOT NULL,
  week_number INTEGER NOT NULL,
  topic TEXT NOT NULL,
  description TEXT,
  learning_outcomes TEXT[],
  readings TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_outlines_course ON public.course_outlines(course_id);

ALTER TABLE public.course_outlines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can view outlines" ON public.course_outlines;
CREATE POLICY "Authenticated can view outlines" ON public.course_outlines
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Staff can manage outlines" ON public.course_outlines;
CREATE POLICY "Staff can manage outlines" ON public.course_outlines
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()::text
      AND users.role IN ('admin', 'lecturer')
    )
  );

-- =====================================================
-- 24. SEARCH QUERIES TABLE (New)
-- =====================================================
DROP TABLE IF EXISTS public.search_queries CASCADE;

CREATE TABLE public.search_queries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  query TEXT NOT NULL,
  results_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_search_user ON public.search_queries(user_id);

ALTER TABLE public.search_queries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can insert searches" ON public.search_queries;
CREATE POLICY "Authenticated can insert searches" ON public.search_queries
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- 25. CRM SYNC TABLE (New)
-- =====================================================
DROP TABLE IF EXISTS public.crm_sync CASCADE;

CREATE TABLE public.crm_sync (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  crm_type TEXT NOT NULL,  -- 'hubspot', 'salesforce', 'zendesk'
  external_id TEXT,
  sync_status TEXT DEFAULT 'pending',
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_crm_user ON public.crm_sync(user_id);

ALTER TABLE public.crm_sync ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own CRM" ON public.crm_sync;
CREATE POLICY "Users can manage own CRM" ON public.crm_sync
  FOR ALL USING (auth.uid()::text = user_id);

-- =====================================================
-- 26. FEATURE ACCESS TABLE (New)
-- =====================================================
DROP TABLE IF EXISTS public.feature_access CASCADE;

CREATE TABLE public.feature_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  feature TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_feature_user ON public.feature_access(user_id, feature);

ALTER TABLE public.feature_access ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own features" ON public.feature_access;
CREATE POLICY "Users can view own features" ON public.feature_access
  FOR SELECT USING (auth.uid()::text = user_id);

-- Add indexes (IF NOT EXISTS to avoid duplicates)
CREATE INDEX IF NOT EXISTS idx_videos_course ON public.lecture_videos(course_id);
CREATE INDEX IF NOT EXISTS idx_materials_course ON public.materials(course_id);
CREATE INDEX IF NOT EXISTS idx_materials_uploader ON public.materials(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_assignments_course ON public.assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_assignments_due ON public.assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_exams_course ON public.exams(course_id);
CREATE INDEX IF NOT EXISTS idx_exams_date ON public.exams(exam_date);
CREATE INDEX IF NOT EXISTS idx_grades_user ON public.grades(user_id);
CREATE INDEX IF NOT EXISTS idx_grades_assignment ON public.grades(assignment_id);
CREATE INDEX IF NOT EXISTS idx_grades_exam ON public.grades(exam_id);
CREATE INDEX IF NOT EXISTS idx_meetings_course ON public.meetings(course_id);
CREATE INDEX IF NOT EXISTS idx_meetings_host ON public.meetings(host_id);
CREATE INDEX IF NOT EXISTS idx_meetings_scheduled ON public.meetings(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_schedules_course ON public.schedules(course_id);
CREATE INDEX IF NOT EXISTS idx_schedules_venue ON public.schedules(venue_id);
CREATE INDEX IF NOT EXISTS idx_events_start ON public.events(start_date);
CREATE INDEX IF NOT EXISTS idx_announcements_published ON public.announcements(is_published);
CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON public.payments(reference);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.billing_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_outlines_course ON public.course_outlines(course_id);
CREATE INDEX IF NOT EXISTS idx_search_user ON public.search_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_crm_user ON public.crm_sync(user_id);

-- =====================================================
-- SECURITY AUDIT CHECK
-- =====================================================
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;