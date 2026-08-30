-- =============================================================================
-- 01_user_profiles.sql
-- Paste AFTER: 00_extensions_and_helpers.sql
-- Auth profile (id = auth.users.id). Signup trigger inserts an empty row.
-- Safe to re-run. Adds columns if you already created this table from an older dump.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  first_name TEXT,
  last_name TEXT,
  age INTEGER,
  gender TEXT,
  height NUMERIC,
  initial_weight NUMERIC,
  fitness_level TEXT,
  goals TEXT[] DEFAULT '{}',
  meals_per_day INTEGER DEFAULT 3,
  calorie_target INTEGER,
  protein_target INTEGER,
  carb_target INTEGER,
  fat_target INTEGER,
  profile_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS meals_per_day INTEGER DEFAULT 3;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS calorie_target INTEGER;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS protein_target INTEGER;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS carb_target INTEGER;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS fat_target INTEGER;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN NOT NULL DEFAULT FALSE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "profiles_select_authenticated" ON public.user_profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.user_profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.user_profiles;

-- Marketplace ratings need to read display names. Writes stay owner-only.
CREATE POLICY "profiles_select_authenticated"
  ON public.user_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert_own"
  ON public.user_profiles FOR INSERT WITH CHECK (auth.uid()::text = id::text);
CREATE POLICY "profiles_update_own"
  ON public.user_profiles FOR UPDATE USING (auth.uid()::text = id::text);
