-- =============================================================================
-- 05_fyte_connect.sql
-- Paste AFTER: 04_progress_tracking.sql
-- Trainers, creators, bookings, purchases, ratings, Instagram handles.
-- Skip this file if you are not using Fyte Connect yet.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.trainer_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  expertise TEXT[] DEFAULT '{}',
  experience_years INTEGER,
  hourly_rate NUMERIC,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  instagram_handle TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.trainer_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES public.trainer_profiles(id) ON DELETE CASCADE,
  session_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  category TEXT,
  bio TEXT,
  instagram_handle TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.creator_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  duration_weeks INTEGER,
  difficulty TEXT,
  cover_image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.plan_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.creator_plans(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, plan_id)
);

CREATE TABLE IF NOT EXISTS public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('trainer', 'creator', 'plan')),
  target_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, target_type, target_id)
);

ALTER TABLE public.trainer_bookings ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE public.trainer_profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.trainer_profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.trainer_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.trainer_profiles ADD COLUMN IF NOT EXISTS expertise TEXT[] DEFAULT '{}';
ALTER TABLE public.trainer_profiles ADD COLUMN IF NOT EXISTS experience_years INTEGER;
ALTER TABLE public.trainer_profiles ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC;
ALTER TABLE public.trainer_profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.trainer_profiles ADD COLUMN IF NOT EXISTS instagram_handle TEXT;
ALTER TABLE public.creators ADD COLUMN IF NOT EXISTS instagram_handle TEXT;

CREATE INDEX IF NOT EXISTS idx_creator_plans_creator_id ON public.creator_plans(creator_id);
CREATE INDEX IF NOT EXISTS idx_trainer_bookings_user_id ON public.trainer_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_plan_purchases_user_id ON public.plan_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_target ON public.ratings(target_type, target_id);
CREATE UNIQUE INDEX IF NOT EXISTS ratings_user_target_uidx ON public.ratings(user_id, target_type, target_id);

DROP TRIGGER IF EXISTS update_trainer_profiles_updated_at ON public.trainer_profiles;
CREATE TRIGGER update_trainer_profiles_updated_at
  BEFORE UPDATE ON public.trainer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.trainer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainer_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "creators_public_read" ON public.creators;
DROP POLICY IF EXISTS "creator_plans_public_read" ON public.creator_plans;
DROP POLICY IF EXISTS "trainer_profiles_public_read" ON public.trainer_profiles;
DROP POLICY IF EXISTS "trainer_profiles_own_write" ON public.trainer_profiles;
DROP POLICY IF EXISTS "trainer_profiles_own_update" ON public.trainer_profiles;
DROP POLICY IF EXISTS "bookings_own" ON public.trainer_bookings;
DROP POLICY IF EXISTS "purchases_own" ON public.plan_purchases;
DROP POLICY IF EXISTS "ratings_public_read" ON public.ratings;
DROP POLICY IF EXISTS "ratings_own_insert" ON public.ratings;
DROP POLICY IF EXISTS "ratings_own_update" ON public.ratings;

CREATE POLICY "creators_public_read" ON public.creators FOR SELECT USING (true);
CREATE POLICY "creator_plans_public_read" ON public.creator_plans FOR SELECT USING (true);
CREATE POLICY "trainer_profiles_public_read" ON public.trainer_profiles FOR SELECT USING (true);
CREATE POLICY "trainer_profiles_own_write" ON public.trainer_profiles FOR INSERT WITH CHECK (auth.uid()::text = id::text);
CREATE POLICY "trainer_profiles_own_update" ON public.trainer_profiles FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "bookings_own" ON public.trainer_bookings FOR ALL
  USING (auth.uid()::text = user_id::text) WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "purchases_own" ON public.plan_purchases FOR ALL
  USING (auth.uid()::text = user_id::text) WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "ratings_public_read" ON public.ratings FOR SELECT USING (true);
CREATE POLICY "ratings_own_insert" ON public.ratings FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "ratings_own_update" ON public.ratings FOR UPDATE USING (auth.uid()::text = user_id::text);
