-- Acadion Extended Schema

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
    dean_id UUID REFERENCES users(id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(institution_id, code)
  );

  -- Add columns to departments
  ALTER TABLE public.departments
    ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES institutions(id) ON
  DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS faculty_id UUID REFERENCES faculties(id) ON DELETE
  SET NULL,
    ADD COLUMN IF NOT EXISTS head_id UUID REFERENCES users(id) ON DELETE SET
  NULL;

  -- Attendance
  CREATE TABLE public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    schedule_id UUID REFERENCES schedules(id) ON DELETE SET NULL,
    instance_date DATE NOT NULL,
    status attendance_status NOT NULL,
    marked_by UUID REFERENCES users(id) ON DELETE SET NULL,
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
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    download_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Search queries
  CREATE TABLE public.search_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    query TEXT NOT NULL,
    result_count INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Indexes for new tables
  CREATE INDEX IF NOT EXISTS idx_institutions_code ON public.institutions(code);
  CREATE INDEX IF NOT EXISTS idx_faculties_institution ON
  public.faculties(institution_id);
  CREATE INDEX IF NOT EXISTS idx_faculties_code ON
  public.faculties(institution_id, code);
  CREATE INDEX IF NOT EXISTS idx_departments_institution ON
  public.departments(institution_id);
  CREATE INDEX IF NOT EXISTS idx_attendance_student ON
  public.attendance(student_id);
  CREATE INDEX IF NOT EXISTS idx_course_materials_course ON
  public.course_materials(course_id);
  CREATE INDEX IF NOT EXISTS idx_venues_institution ON
  public.venues(institution_id);

  -- Triggers for new tables
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname =
  'update_institutions_updated_at') THEN
      CREATE TRIGGER update_institutions_updated_at BEFORE UPDATE ON
  public.institutions
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
  END $$;

  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname =
  'update_faculties_updated_at') THEN
      CREATE TRIGGER update_faculties_updated_at BEFORE UPDATE ON
  public.faculties
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
  END $$;

  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname =
  'update_course_materials_updated_at') THEN
      CREATE TRIGGER update_course_materials_updated_at BEFORE UPDATE ON
  public.course_materials
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
  END $$;
