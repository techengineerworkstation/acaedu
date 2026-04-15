-- Acadion Extended Schema
-- Adds: dean role, institutions, faculties, attendance, venues
-- Includes RLS policies for extended tables

-- Add dean to user_role enum
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    BEGIN
      ALTER TYPE public.user_role ADD VALUE 'dean';
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
  END IF;
END $$;

-- Drop new tables if re-running
DROP TABLE IF EXISTS public.search_queries CASCADE;
DROP TABLE IF EXISTS public.course_materials CASCADE;
DROP TABLE IF EXISTS public.venues CASCADE;
DROP TABLE IF EXISTS public.attendance CASCADE;
DROP TABLE IF EXISTS public.faculties CASCADE;
DROP TABLE IF EXISTS public.institutions CASCADE;

-- Institutions
CREATE TABLE public.institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(500) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  logo_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#3B82F6',
  secondary_color VARCHAR(7) DEFAULT '#10B981',
  domain VARCHAR(255),
  address TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  website TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Faculties
CREATE TABLE public.faculties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
  name VARCHAR(500) NOT NULL,
  code VARCHAR(50) NOT NULL,
  dean_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(institution_id, code)
);

-- Add columns to departments
ALTER TABLE public.departments
  ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS faculty_id UUID REFERENCES faculties(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS head_id TEXT REFERENCES users(id) ON DELETE SET NULL;

-- Attendance
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES schedules(id) ON DELETE SET NULL,
  instance_date DATE NOT NULL,
  status attendance_status NOT NULL,
  marked_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  marked_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  UNIQUE(student_id, course_id, instance_date, schedule_id)
);

-- Venues
CREATE TABLE public.venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  building VARCHAR(255),
  floor INTEGER,
  room_number VARCHAR(50),
  capacity INTEGER DEFAULT 30,
  facilities TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(institution_id, code)
);

-- Course materials
CREATE TABLE public.course_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type VARCHAR(100),
  file_size INTEGER,
  uploaded_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  download_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Search queries
CREATE TABLE public.search_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  query TEXT NOT NULL,
  result_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for new tables
CREATE INDEX IF NOT EXISTS idx_institutions_code ON public.institutions(code);
CREATE INDEX IF NOT EXISTS idx_faculties_institution ON public.faculties(institution_id);
CREATE INDEX IF NOT EXISTS idx_faculties_code ON public.faculties(institution_id, code);
CREATE INDEX IF NOT EXISTS idx_departments_institution ON public.departments(institution_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON public.attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_course_materials_course ON public.course_materials(course_id);
CREATE INDEX IF NOT EXISTS idx_venues_institution ON public.venues(institution_id);

-- Triggers for new tables
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_institutions_updated_at') THEN
    CREATE TRIGGER update_institutions_updated_at BEFORE UPDATE ON public.institutions
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_faculties_updated_at') THEN
    CREATE TRIGGER update_faculties_updated_at BEFORE UPDATE ON public.faculties
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_course_materials_updated_at') THEN
    CREATE TRIGGER update_course_materials_updated_at BEFORE UPDATE ON public.course_materials
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- =====================================================
-- ROW LEVEL SECURITY FOR EXTENDED SCHEMA TABLES
-- =====================================================

-- Enable RLS for extended tables
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_queries ENABLE ROW LEVEL SECURITY;

-- Institutions policies
CREATE POLICY "Institutions viewable by authenticated" ON public.institutions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Institutions manageable by admins" ON public.institutions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'admin')
  );

-- Faculties policies
CREATE POLICY "Faculties viewable by authenticated" ON public.faculties
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Faculties manageable by admins and deans" ON public.faculties
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role IN ('admin', 'dean'))
  );

-- Attendance policies
CREATE POLICY "Attendance viewable by enrolled and staff" ON public.attendance
  FOR SELECT USING (
    student_id = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role IN ('admin', 'lecturer')
    )
  );

CREATE POLICY "Attendance manageable by staff" ON public.attendance
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role IN ('admin', 'lecturer'))
  );

-- Venues policies
CREATE POLICY "Venues viewable by authenticated" ON public.venues
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Venues manageable by admins" ON public.venues
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'admin')
  );

-- Course materials policies
CREATE POLICY "Course materials viewable by enrolled" ON public.course_materials
  FOR SELECT USING (
    is_public = TRUE
    OR EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE student_id = auth.uid()::text AND course_id = public.course_materials.course_id
    )
    OR EXISTS (
      SELECT 1 FROM public.courses
      WHERE id = public.course_materials.course_id AND lecturer_id = auth.uid()::text
    )
  );

CREATE POLICY "Course materials upload by lecturers" ON public.course_materials
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE id = public.course_materials.course_id AND lecturer_id = auth.uid()::text
    )
    OR EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

-- Search queries policies
CREATE POLICY "Search queries own access" ON public.search_queries
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Search queries insert allowed" ON public.search_queries
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);
