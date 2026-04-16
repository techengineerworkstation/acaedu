-- =====================================================
-- ACAEDU TABLES & SECURITY POLICIES
-- Run these queries in Supabase SQL Editor
-- Creates tables if they don't exist, then adds security policies
-- =====================================================

-- =====================================================
-- 1. LECTURE VIDEOS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.lecture_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  course_id TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER,
  week_number INTEGER,
  uploaded_by TEXT NOT NULL,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DROP POLICY IF EXISTS "Authenticated can view videos" ON public.lecture_videos;
CREATE POLICY "Authenticated can view videos" ON public.lecture_videos FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Staff can upload videos" ON public.lecture_videos;
CREATE POLICY "Staff can upload videos" ON public.lecture_videos FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid()::text AND users.role IN ('admin', 'lecturer'))
);

-- =====================================================
-- 2. MATERIALS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.materials (
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

DROP POLICY IF EXISTS "Authenticated can view materials" ON public.materials;
CREATE POLICY "Authenticated can view materials" ON public.materials FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Lecturers can upload materials" ON public.materials;
CREATE POLICY "Lecturers can upload materials" ON public.materials FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid()::text AND users.role IN ('admin', 'lecturer'))
);
DROP POLICY IF EXISTS "Owners can delete materials" ON public.materials;
CREATE POLICY "Owners can delete materials" ON public.materials FOR DELETE USING (auth.uid()::text = uploaded_by);

-- =====================================================
-- 3. ASSIGNMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.assignments (
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

DROP POLICY IF EXISTS "Authenticated can view assignments" ON public.assignments;
CREATE POLICY "Authenticated can view assignments" ON public.assignments FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Lecturers can create assignments" ON public.assignments;
CREATE POLICY "Lecturers can create assignments" ON public.assignments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid()::text AND users.role IN ('admin', 'lecturer'))
);
DROP POLICY IF EXISTS "Creators can manage assignments" ON public.assignments;
CREATE POLICY "Creators can manage assignments" ON public.assignments FOR ALL USING (auth.uid()::text = created_by);

-- =====================================================
-- 4. EXAMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.exams (
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

DROP POLICY IF EXISTS "Authenticated can view exams" ON public.exams;
CREATE POLICY "Authenticated can view exams" ON public.exams FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Lecturers can create exams" ON public.exams;
CREATE POLICY "Lecturers can create exams" ON public.exams FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid()::text AND users.role IN ('admin', 'lecturer'))
);
DROP POLICY IF EXISTS "Creators can manage exams" ON public.exams;
CREATE POLICY "Creators can manage exams" ON public.exams FOR ALL USING (auth.uid()::text = created_by);

-- =====================================================
-- 5. GRADES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.grades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  assignment_id TEXT,
  exam_id TEXT,
  score INTEGER,
  feedback TEXT,
  graded_by TEXT,
  graded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DROP POLICY IF EXISTS "Users can view own grades" ON public.grades;
CREATE POLICY "Users can view own grades" ON public.grades FOR SELECT USING (auth.uid()::text = user_id);
DROP POLICY IF EXISTS "Lecturers can view grades" ON public.grades;
CREATE POLICY "Lecturers can view grades" ON public.grades FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid()::text AND users.role IN ('admin', 'lecturer'))
);
DROP POLICY IF EXISTS "Lecturers can insert grades" ON public.grades;
CREATE POLICY "Lecturers can insert grades" ON public.grades FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid()::text AND users.role IN ('admin', 'lecturer'))
);
DROP POLICY IF EXISTS "Graders can update grades" ON public.grades;
CREATE POLICY "Graders can update grades" ON public.grades FOR UPDATE USING (auth.uid()::text = graded_by);

-- =====================================================
-- 6. MEETINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.meetings (
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

DROP POLICY IF EXISTS "Authenticated can view meetings" ON public.meetings;
CREATE POLICY "Authenticated can view meetings" ON public.meetings FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Lecturers can create meetings" ON public.meetings;
CREATE POLICY "Lecturers can create meetings" ON public.meetings FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid()::text AND users.role IN ('admin', 'lecturer'))
);
DROP POLICY IF EXISTS "Hosts can manage meetings" ON public.meetings;
CREATE POLICY "Hosts can manage meetings" ON public.meetings FOR ALL USING (auth.uid()::text = host_id);

-- =====================================================
-- 7. CLASS VENUES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.class_venues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  building TEXT,
  capacity INTEGER DEFAULT 30,
  room_number TEXT,
  venue_type TEXT DEFAULT 'classroom',
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DROP POLICY IF EXISTS "Authenticated can view venues" ON public.class_venues;
CREATE POLICY "Authenticated can view venues" ON public.class_venues FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Admins can manage venues" ON public.class_venues;
CREATE POLICY "Admins can manage venues" ON public.class_venues FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid()::text AND users.role = 'admin')
);

-- =====================================================
-- 8. SCHEDULES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id TEXT NOT NULL,
  venue_id TEXT,
  day_of_week INTEGER NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  semester INTEGER DEFAULT 1,
  year INTEGER DEFAULT 2024,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DROP POLICY IF EXISTS "Authenticated can view schedules" ON public.schedules;
CREATE POLICY "Authenticated can view schedules" ON public.schedules FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Staff can manage schedules" ON public.schedules;
CREATE POLICY "Staff can manage schedules" ON public.schedules FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid()::text AND users.role IN ('admin', 'lecturer'))
);

-- =====================================================
-- 9. EVENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.events (
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

DROP POLICY IF EXISTS "Authenticated can view events" ON public.events;
CREATE POLICY "Authenticated can view events" ON public.events FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Admins can manage events" ON public.events;
CREATE POLICY "Admins can manage events" ON public.events FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid()::text AND users.role = 'admin')
);

-- =====================================================
-- 10. ANNOUNCEMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id TEXT NOT NULL,
  target_roles TEXT[],
  target_courses TEXT[],
  is_published BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DROP POLICY IF EXISTS "Authenticated can view announcements" ON public.announcements;
CREATE POLICY "Authenticated can view announcements" ON public.announcements FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Staff can manage announcements" ON public.announcements;
CREATE POLICY "Staff can manage announcements" ON public.announcements FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid()::text AND users.role IN ('admin', 'lecturer'))
);

-- =====================================================
-- 11. PAYMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  reference TEXT UNIQUE,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (auth.uid()::text = user_id);
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;
CREATE POLICY "Admins can view all payments" ON public.payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid()::text AND users.role = 'admin')
);

-- =====================================================
-- 12. BILLING SUBSCRIPTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.billing_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  plan TEXT DEFAULT 'free',
  status TEXT DEFAULT 'active',
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DROP POLICY IF EXISTS "Users can view own subscription" ON public.billing_subscriptions;
CREATE POLICY "Users can view own subscription" ON public.billing_subscriptions FOR SELECT USING (auth.uid()::text = user_id);

-- =====================================================
-- 13. COURSE OUTLINES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.course_outlines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id TEXT NOT NULL,
  week_number INTEGER NOT NULL,
  topic TEXT NOT NULL,
  description TEXT,
  learning_outcomes TEXT[],
  readings TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DROP POLICY IF EXISTS "Authenticated can view outlines" ON public.course_outlines;
CREATE POLICY "Authenticated can view outlines" ON public.course_outlines FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Staff can manage outlines" ON public.course_outlines;
CREATE POLICY "Staff can manage outlines" ON public.course_outlines FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid()::text AND users.role IN ('admin', 'lecturer'))
);

-- =====================================================
-- 14. SEARCH QUERIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.search_queries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  query TEXT NOT NULL,
  results_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DROP POLICY IF EXISTS "Authenticated can insert searches" ON public.search_queries;
CREATE POLICY "Authenticated can insert searches" ON public.search_queries FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- 15. CRM SYNC TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.crm_sync (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  crm_type TEXT NOT NULL,
  external_id TEXT,
  sync_status TEXT DEFAULT 'pending',
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DROP POLICY IF EXISTS "Users can manage own CRM" ON public.crm_sync;
CREATE POLICY "Users can manage own CRM" ON public.crm_sync FOR ALL USING (auth.uid()::text = user_id);

-- =====================================================
-- 16. FEATURE ACCESS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.feature_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  feature TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DROP POLICY IF EXISTS "Users can view own features" ON public.feature_access;
CREATE POLICY "Users can view own features" ON public.feature_access FOR SELECT USING (auth.uid()::text = user_id);

-- =====================================================
-- VERIFY TABLES & RLS
-- =====================================================
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true ORDER BY tablename;