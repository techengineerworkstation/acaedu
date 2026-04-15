-- Add missing currency billing fields to institution_settings
-- and is_sample flag to all relevant tables for sample data management
-- Date: 2026-04-07

-- =====================================================
-- ADD MISSING COLUMNS TO INSTITUTION_SETTINGS
-- =====================================================

ALTER TABLE public.institution_settings
  ADD COLUMN IF NOT EXISTS default_currency_code TEXT DEFAULT 'NGN',
  ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS currency_position TEXT DEFAULT 'before'; -- 'before' or 'after'

-- Update existing row with default values if null
UPDATE institution_settings
SET
  default_currency_code = COALESCE(default_currency_code, 'NGN'),
  tax_rate = COALESCE(tax_rate, 0.00),
  currency_position = COALESCE(currency_position, 'before')
WHERE default_currency_code IS NULL OR tax_rate IS NULL OR currency_position IS NULL;


-- =====================================================
-- ADD IS_SAMPLE FLAG TO TABLES
-- =====================================================

-- Users
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS is_sample BOOLEAN DEFAULT FALSE;

-- Courses
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS is_sample BOOLEAN DEFAULT FALSE;

-- Schedules
ALTER TABLE public.schedules
  ADD COLUMN IF NOT EXISTS is_sample BOOLEAN DEFAULT FALSE;

-- Announcements
ALTER TABLE public.announcements
  ADD COLUMN IF NOT EXISTS is_sample BOOLEAN DEFAULT FALSE;

-- Events
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS is_sample BOOLEAN DEFAULT FALSE;

-- Course Materials
ALTER TABLE public.course_materials
  ADD COLUMN IF NOT EXISTS is_sample BOOLEAN DEFAULT FALSE;

-- Enrollments (if we want to mark sample enrollments)
ALTER TABLE public.enrollments
  ADD COLUMN IF NOT EXISTS is_sample BOOLEAN DEFAULT FALSE;

-- Subscription Plans
ALTER TABLE public.subscription_plans
  ADD COLUMN IF NOT EXISTS is_sample BOOLEAN DEFAULT FALSE;

-- Payments (sample payment records)
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS is_sample BOOLEAN DEFAULT FALSE;

-- Schedule Instances
ALTER TABLE public.schedule_instances
  ADD COLUMN IF NOT EXISTS is_sample BOOLEAN DEFAULT FALSE;

-- Assignments
ALTER TABLE public.assignments
  ADD COLUMN IF NOT EXISTS is_sample BOOLEAN DEFAULT FALSE;

-- Exams
ALTER TABLE public.exams
  ADD COLUMN IF NOT EXISTS is_sample BOOLEAN DEFAULT FALSE;

-- Grade (if seeding sample grades)
ALTER TABLE public.grades
  ADD COLUMN IF NOT EXISTS is_sample BOOLEAN DEFAULT FALSE;

-- Departments (if seeding sample departments)
ALTER TABLE public.departments
  ADD COLUMN IF NOT EXISTS is_sample BOOLEAN DEFAULT FALSE;

-- Institutions (if seeding sample institutions)
ALTER TABLE public.institutions
  ADD COLUMN IF NOT EXISTS is_sample BOOLEAN DEFAULT FALSE;

-- Faculties (if seeding sample faculties)
ALTER TABLE public.faculties
  ADD COLUMN IF NOT EXISTS is_sample BOOLEAN DEFAULT FALSE;

-- Venues (if seeding sample venues)
ALTER TABLE public.venues
  ADD COLUMN IF NOT EXISTS is_sample BOOLEAN DEFAULT FALSE;

-- Videos (if seeding sample lecture videos)
ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS is_sample BOOLEAN DEFAULT FALSE;


-- =====================================================
-- INDEXES FOR is_sample (for fast cleanup queries)
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_users_is_sample ON public.users(is_sample);
CREATE INDEX IF NOT EXISTS idx_courses_is_sample ON public.courses(is_sample);
CREATE INDEX IF NOT EXISTS idx_schedules_is_sample ON public.schedules(is_sample);
CREATE INDEX IF NOT EXISTS idx_announcements_is_sample ON public.announcements(is_sample);
CREATE INDEX IF NOT EXISTS idx_events_is_sample ON public.events(is_sample);
CREATE INDEX IF NOT EXISTS idx_course_materials_is_sample ON public.course_materials(is_sample);
CREATE INDEX IF NOT EXISTS idx_enrollments_is_sample ON public.enrollments(is_sample);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_is_sample ON public.subscription_plans(is_sample);
CREATE INDEX IF NOT EXISTS idx_payments_is_sample ON public.payments(is_sample);
CREATE INDEX IF NOT EXISTS idx_schedule_instances_is_sample ON public.schedule_instances(is_sample);
CREATE INDEX IF NOT EXISTS idx_assignments_is_sample ON public.assignments(is_sample);
CREATE INDEX IF NOT EXISTS idx_exams_is_sample ON public.exams(is_sample);
CREATE INDEX IF NOT EXISTS idx_grades_is_sample ON public.grades(is_sample);
CREATE INDEX IF NOT EXISTS idx_departments_is_sample ON public.departments(is_sample);
CREATE INDEX IF NOT EXISTS idx_institutions_is_sample ON public.institutions(is_sample);
CREATE INDEX IF NOT EXISTS idx_faculties_is_sample ON public.faculties(is_sample);
CREATE INDEX IF NOT EXISTS idx_venues_is_sample ON public.venues(is_sample);
CREATE INDEX IF NOT EXISTS idx_videos_is_sample ON public.videos(is_sample);


-- =====================================================
-- RLS POLICIES FOR is_sample (if needed)
-- =====================================================
-- Note: RLS already enabled on most tables. is_sample column is not restricted by RLS
-- but can be used in queries to filter sample data for admins only when needed.
-- No additional RLS policies needed as is_sample is not a security boundary, just a marker.
