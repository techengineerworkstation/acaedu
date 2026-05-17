-- Acadion Holiday Table
-- Adds table for storing public and custom holidays

-- Create holiday table
CREATE TABLE IF NOT EXISTS public.holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('public', 'custom')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;

-- Create policies for holidays
-- Admins can manage holidays for their institution
CREATE POLICY "Admins can manage holidays for their institution"
ON public.holidays
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'dean')
    AND users.institution_id = holidays.institution_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'dean')
    AND users.institution_id = holidays.institution_id
  )
);

-- Everyone can view holidays (read-only)
CREATE POLICY "Anyone can view holidays"
ON public.holidays
FOR SELECT
USING (TRUE);

-- Create index for faster lookups by date
CREATE INDEX IF NOT EXISTS idx_holidays_date ON public.holidays(date);