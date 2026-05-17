-- Acadion Tests Table
-- Adds table for storing tests (separate from exams)

-- Create tests table
CREATE TABLE IF NOT EXISTS public.tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  test_type VARCHAR(50) NOT NULL DEFAULT 'quiz',
  test_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  location VARCHAR(255),
  total_marks INTEGER NOT NULL DEFAULT 50,
  passing_marks INTEGER NOT NULL DEFAULT 25,
  instructions TEXT,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;

-- Create policies for tests
-- Admins can manage all tests
CREATE POLICY "Admins can manage all tests"
ON public.tests
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Lecturers can manage tests for their courses
CREATE POLICY "Lecturers can manage tests for their courses"
ON public.tests
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = tests.course_id
    AND courses.lecturer_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = tests.course_id
    AND courses.lecturer_id = auth.uid()
  )
);

-- Students can view tests for their enrolled courses
CREATE POLICY "Students can view tests for enrolled courses"
ON public.tests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM enrollments
    WHERE enrollments.course_id = tests.course_id
    AND enrollments.student_id = auth.uid()
    AND enrollments.status = 'active'
  )
);

-- Create index for faster lookups by date
CREATE INDEX IF NOT EXISTS idx_tests_test_date ON public.tests(test_date);