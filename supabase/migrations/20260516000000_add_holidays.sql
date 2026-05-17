-- Create holidays table
CREATE TABLE public.holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, name)
);

-- Enable RLS
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read holidays
CREATE POLICY "Anyone can view holidays" ON public.holidays
  FOR SELECT USING (true);

-- Allow admins to manage holidays
CREATE POLICY "Admins can manage holidays" ON public.holidays
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid()::text AND users.role = 'admin'
    )
  );

-- Nigerian Public Holidays
INSERT INTO public.holidays (name, date, description, is_public) VALUES
  ('New Year''s Day', '2026-01-01', 'Nigerian Public Holiday', true),
  ('Workers'' Day', '2026-05-01', 'Nigerian Public Holiday - International Workers'' Day', true),
  ('Children''s Day', '2026-05-27', 'Nigerian Public Holiday', true),
  ('Democracy Day', '2026-06-12', 'Nigerian Public Holiday - Commemorating the restoration of democracy', true),
  ('Independence Day', '2026-10-01', 'Nigerian Public Holiday - Nigeria''s independence from Britain (1960)', true),
  ('Christmas Day', '2026-12-25', 'Nigerian Public Holiday', true),
  ('Boxing Day', '2026-12-26', 'Nigerian Public Holiday', true),
  ('Eid al-Fitr', '2026-03-30', 'Nigerian Public Holiday - End of Ramadan (date may vary)', true),
  ('Eid al-Adha', '2026-06-06', 'Nigerian Public Holiday - Festival of Sacrifice (date may vary)', true),
  ('Mawlid', '2026-09-04', 'Nigerian Public Holiday - Prophet''s Birthday (date may vary)', true),
  ('Good Friday', '2026-04-03', 'Nigerian Public Holiday (date may vary)', true),
  ('Easter Monday', '2026-04-06', 'Nigerian Public Holiday (date may vary)', true);
