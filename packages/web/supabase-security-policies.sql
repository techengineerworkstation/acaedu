-- =====================================================
-- ACAEDU SECURITY POLICIES UPDATE
-- Run these queries in Supabase SQL Editor
-- Adds RLS policies to existing tables
-- =====================================================

-- =====================================================
-- 1. LECTURE VIDEOS - Add security policies
-- =====================================================
ALTER TABLE public.lecture_videos ENABLE ROW LEVEL SECURITY IF NOT EXISTS;

DROP POLICY IF EXISTS "Authenticated can view videos" ON public.lecture_videos;
CREATE POLICY "Authenticated can view videos" ON public.lecture_videos
  FOR SELECT USING (auth.uid() IS NOT NULL);

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
-- 2. MATERIALS - Add security policies
-- =====================================================
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY IF NOT EXISTS;

DROP POLICY IF EXISTS "Authenticated can view materials" ON public.materials;
CREATE POLICY "Authenticated can view materials" ON public.materials
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Lecturers can upload materials" ON public.materials;
CREATE POLICY "Lecturers can upload materials" ON public.materials
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()::text
      AND users.role IN ('admin', 'lecturer')
    )
  );

DROP POLICY IF EXISTS "Owners can delete materials" ON public.materials;
CREATE POLICY "Owners can delete materials" ON public.materials
  FOR DELETE USING (auth.uid()::text = uploaded_by);

-- =====================================================
-- 3. ASSIGNMENTS - Add security policies
-- =====================================================
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY IF NOT EXISTS;

DROP POLICY IF EXISTS "Authenticated can view assignments" ON public.assignments;
CREATE POLICY "Authenticated can view assignments" ON public.assignments
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Lecturers can create assignments" ON public.assignments;
CREATE POLICY "Lecturers can create assignments" ON public.assignments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()::text
      AND users.role IN ('admin', 'lecturer')
    )
  );

DROP POLICY IF EXISTS "Creators can manage assignments" ON public.assignments;
CREATE POLICY "Creators can manage assignments" ON public.assignments
  FOR ALL USING (auth.uid()::text = created_by);

-- =====================================================
-- 4. EXAMS - Add security policies
-- =====================================================
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY IF NOT EXISTS;

DROP POLICY IF EXISTS "Authenticated can view exams" ON public.exams;
CREATE POLICY "Authenticated can view exams" ON public.exams
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Lecturers can create exams" ON public.exams;
CREATE POLICY "Lecturers can create exams" ON public.exams
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()::text
      AND users.role IN ('admin', 'lecturer')
    )
  );

DROP POLICY IF EXISTS "Creators can manage exams" ON public.exams;
CREATE POLICY "Creators can manage exams" ON public.exams
  FOR ALL USING (auth.uid()::text = created_by);

-- =====================================================
-- 5. GRADES - Add security policies
-- =====================================================
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY IF NOT EXISTS;

DROP POLICY IF EXISTS "Users can view own grades" ON public.grades;
CREATE POLICY "Users can view own grades" ON public.grades
  FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Lecturers can view grades" ON public.grades;
CREATE POLICY "Lecturers can view grades" ON public.grades
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()::text
      AND users.role IN ('admin', 'lecturer')
    )
  );

DROP POLICY IF EXISTS "Lecturers can insert grades" ON public.grades;
CREATE POLICY "Lecturers can insert grades" ON public.grades
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()::text
      AND users.role IN ('admin', 'lecturer')
    )
  );

DROP POLICY IF EXISTS "Graders can update grades" ON public.grades;
CREATE POLICY "Graders can update grades" ON public.grades
  FOR UPDATE USING (auth.uid()::text = graded_by);

-- =====================================================
-- 6. MEETINGS - Add security policies
-- =====================================================
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY IF NOT EXISTS;

DROP POLICY IF EXISTS "Authenticated can view meetings" ON public.meetings;
CREATE POLICY "Authenticated can view meetings" ON public.meetings
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Lecturers can create meetings" ON public.meetings;
CREATE POLICY "Lecturers can create meetings" ON public.meetings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()::text
      AND users.role IN ('admin', 'lecturer')
    )
  );

DROP POLICY IF EXISTS "Hosts can manage meetings" ON public.meetings;
CREATE POLICY "Hosts can manage meetings" ON public.meetings
  FOR ALL USING (auth.uid()::text = host_id);

-- =====================================================
-- 7. CLASS VENUES - Add security policies
-- =====================================================
ALTER TABLE public.class_venues ENABLE ROW LEVEL SECURITY IF NOT EXISTS;

DROP POLICY IF EXISTS "Authenticated can view venues" ON public.class_venues;
CREATE POLICY "Authenticated can view venues" ON public.class_venues
  FOR SELECT USING (auth.uid() IS NOT NULL);

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
-- 8. SCHEDULES - Add security policies
-- =====================================================
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY IF NOT EXISTS;

DROP POLICY IF EXISTS "Authenticated can view schedules" ON public.schedules;
CREATE POLICY "Authenticated can view schedules" ON public.schedules
  FOR SELECT USING (auth.uid() IS NOT NULL);

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
-- 9. EVENTS - Add security policies
-- =====================================================
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY IF NOT EXISTS;

DROP POLICY IF EXISTS "Authenticated can view events" ON public.events;
CREATE POLICY "Authenticated can view events" ON public.events
  FOR SELECT USING (auth.uid() IS NOT NULL);

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
-- 10. ANNOUNCEMENTS - Add security policies
-- =====================================================
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY IF NOT EXISTS;

DROP POLICY IF EXISTS "Authenticated can view announcements" ON public.announcements;
CREATE POLICY "Authenticated can view announcements" ON public.announcements
  FOR SELECT USING (auth.uid() IS NOT NULL);

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
-- 11. PAYMENTS - Add security policies
-- =====================================================
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY IF NOT EXISTS;

DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (auth.uid()::text = user_id);

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
-- 12. BILLING SUBSCRIPTIONS - Add security policies
-- =====================================================
ALTER TABLE public.billing_subscriptions ENABLE ROW LEVEL SECURITY IF NOT EXISTS;

DROP POLICY IF EXISTS "Users can view own subscription" ON public.billing_subscriptions;
CREATE POLICY "Users can view own subscription" ON public.billing_subscriptions
  FOR SELECT USING (auth.uid()::text = user_id);

-- =====================================================
-- 13. COURSE OUTLINES - Add security policies
-- =====================================================
ALTER TABLE public.course_outlines ENABLE ROW LEVEL SECURITY IF NOT EXISTS;

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
-- 14. SEARCH QUERIES - Add security policies
-- =====================================================
ALTER TABLE public.search_queries ENABLE ROW LEVEL SECURITY IF NOT EXISTS;

DROP POLICY IF EXISTS "Authenticated can insert searches" ON public.search_queries;
CREATE POLICY "Authenticated can insert searches" ON public.search_queries
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- 15. CRM SYNC - Add security policies
-- =====================================================
ALTER TABLE public.crm_sync ENABLE ROW LEVEL SECURITY IF NOT EXISTS;

DROP POLICY IF EXISTS "Users can manage own CRM" ON public.crm_sync;
CREATE POLICY "Users can manage own CRM" ON public.crm_sync
  FOR ALL USING (auth.uid()::text = user_id);

-- =====================================================
-- 16. FEATURE ACCESS - Add security policies
-- =====================================================
ALTER TABLE public.feature_access ENABLE ROW LEVEL SECURITY IF NOT EXISTS;

DROP POLICY IF EXISTS "Users can view own features" ON public.feature_access;
CREATE POLICY "Users can view own features" ON public.feature_access
  FOR SELECT USING (auth.uid()::text = user_id);

-- =====================================================
-- VERIFY RLS POLICIES
-- =====================================================
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = true
ORDER BY tablename;