-- Acadion Missing Tables and Columns Migration
-- Date: 2026-04-07

-- Enable uuid-ossp if not already
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- INSTITUTION_SETTINGS TABLE (single-row config)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.institution_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_name TEXT NOT NULL DEFAULT 'Acadion',
  motto TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  primary_color TEXT DEFAULT '#0ea5e9',
  secondary_color TEXT DEFAULT '#6366f1',
  accent_color TEXT DEFAULT '#f59e0b',
  background_color TEXT DEFAULT '#ffffff',
  surface_color TEXT DEFAULT '#f8fafc',
  text_primary_color TEXT DEFAULT '#1e293b',
  text_secondary_color TEXT DEFAULT '#64748b',
  theme_preset TEXT DEFAULT 'turquoise',
  website_url TEXT,
  facebook_url TEXT,
  twitter_url TEXT,
  instagram_url TEXT,
  support_email TEXT,
  contact_phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Insert default row with well-known ID (used by code)
INSERT INTO institution_settings (id)
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for institution_settings
ALTER TABLE public.institution_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view institution settings"
  ON institution_settings FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can update institution settings"
  ON institution_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_institution_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_institution_settings_updated_at ON public.institution_settings;
CREATE TRIGGER update_institution_settings_updated_at
  BEFORE UPDATE ON institution_settings
  FOR EACH ROW EXECUTE FUNCTION update_institution_settings_updated_at();


-- =====================================================
-- SUBSCRIPTION_PLANS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institution_settings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2) NOT NULL,
  currency_code TEXT NOT NULL DEFAULT 'NGN',
  max_users INTEGER NOT NULL DEFAULT 100,
  features TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for subscription_plans
CREATE INDEX IF NOT EXISTS idx_subscription_plans_institution ON subscription_plans(institution_id);

-- Trigger for updated_at on subscription_plans
DROP TRIGGER IF EXISTS update_subscription_plans_updated_at ON public.subscription_plans;
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for subscription_plans
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Only admins can view subscription plans
CREATE POLICY "Admins can view subscription plans"
  ON subscription_plans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

-- Admins can manage subscription plans
CREATE POLICY "Admins can manage subscription plans"
  ON subscription_plans FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  );


-- =====================================================
-- ALTER COURSES TABLE: Add missing columns
-- =====================================================

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS summary TEXT,
  ADD COLUMN IF NOT EXISTS color VARCHAR(7);

-- =====================================================
-- GRANTS (if needed)
-- =====================================================

-- Ensure anon and authenticated can read institution_settings and subscription_plans where allowed by RLS
-- (RLS policies already defined, no extra GRANT needed beyond existing)
