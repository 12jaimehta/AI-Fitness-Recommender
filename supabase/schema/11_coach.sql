-- =============================================================================
-- 11_coach.sql
-- Paste AFTER: 10_daily_track.sql (and 02_ai_plans.sql)
-- AI personal trainer: slots, events, interviews, daily ledger, weekly review.
-- Safe to re-run.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.coach_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  goal TEXT,
  phase TEXT NOT NULL DEFAULT 'onboarding'
    CHECK (phase IN ('onboarding', 'block', 'diet_break', 'maintenance')),
  block_started_on DATE,
  target_kcal INTEGER,
  target_protein_g INTEGER,
  diet_plan_id UUID,
  workout_plan_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.coach_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('meal', 'session')),
  slot_key TEXT NOT NULL,
  title TEXT NOT NULL,
  budget_kcal INTEGER NOT NULL DEFAULT 0,
  budget_protein_g NUMERIC(6,1) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned', 'as_planned', 'replaced', 'ate_other', 'skipped', 'done')),
  actual_kcal INTEGER,
  actual_protein_g NUMERIC(6,1),
  actual_label TEXT,
  feel TEXT CHECK (feel IS NULL OR feel IN ('easy', 'right', 'too_hard')),
  plan_ref JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, date, kind, slot_key)
);

CREATE TABLE IF NOT EXISTS public.coach_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  slot_id UUID REFERENCES public.coach_slots(id) ON DELETE SET NULL,
  kind TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  client_event_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS coach_events_idempotency
  ON public.coach_events (user_id, client_event_id)
  WHERE client_event_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS coach_events_user_date
  ON public.coach_events (user_id, date DESC, created_at DESC);

CREATE TABLE IF NOT EXISTS public.coach_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'interview',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS coach_preferences_user
  ON public.coach_preferences (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.coach_interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slot_id UUID REFERENCES public.coach_slots(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('meal_other', 'meal_dislike', 'session_dislike')),
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'answered', 'applied', 'abandoned')),
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  draft JSONB NOT NULL DEFAULT '{}'::jsonb,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 minutes'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS coach_interviews_user_open
  ON public.coach_interviews (user_id, created_at DESC)
  WHERE status = 'open';

CREATE TABLE IF NOT EXISTS public.coach_daily (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  planned_kcal INTEGER NOT NULL DEFAULT 0,
  actual_kcal INTEGER NOT NULL DEFAULT 0,
  surplus_kcal INTEGER NOT NULL DEFAULT 0,
  extra_steps_target INTEGER NOT NULL DEFAULT 0,
  extra_steps_done INTEGER NOT NULL DEFAULT 0,
  carryover_kcal INTEGER NOT NULL DEFAULT 0,
  carryover_applied BOOLEAN NOT NULL DEFAULT false,
  meals_planned INTEGER NOT NULL DEFAULT 0,
  meals_logged INTEGER NOT NULL DEFAULT 0,
  session_planned BOOLEAN NOT NULL DEFAULT false,
  session_done BOOLEAN NOT NULL DEFAULT false,
  weight_kg NUMERIC(5,2),
  sleep_hours NUMERIC(3,1),
  energy TEXT CHECK (energy IS NULL OR energy IN ('low', 'ok', 'high')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, date)
);

CREATE TABLE IF NOT EXISTS public.coach_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  waist_cm NUMERIC(5,1),
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, date)
);

CREATE TABLE IF NOT EXISTS public.coach_week_reviews (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  attendance_pct NUMERIC(5,1),
  meal_adherence_pct NUMERIC(5,1),
  weight_avg_kg NUMERIC(5,2),
  weight_delta_kg NUMERIC(4,2),
  waist_delta_cm NUMERIC(4,1),
  decision TEXT NOT NULL DEFAULT 'hold',
  headline TEXT NOT NULL,
  body TEXT NOT NULL,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, week_start)
);

CREATE INDEX IF NOT EXISTS coach_slots_user_date
  ON public.coach_slots (user_id, date);
CREATE INDEX IF NOT EXISTS coach_daily_user_date
  ON public.coach_daily (user_id, date DESC);
CREATE INDEX IF NOT EXISTS coach_measurements_user_date
  ON public.coach_measurements (user_id, date DESC);

DROP TRIGGER IF EXISTS update_coach_profiles_updated_at ON public.coach_profiles;
CREATE TRIGGER update_coach_profiles_updated_at
  BEFORE UPDATE ON public.coach_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_coach_slots_updated_at ON public.coach_slots;
CREATE TRIGGER update_coach_slots_updated_at
  BEFORE UPDATE ON public.coach_slots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_coach_daily_updated_at ON public.coach_daily;
CREATE TRIGGER update_coach_daily_updated_at
  BEFORE UPDATE ON public.coach_daily
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.coach_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_week_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS coach_profiles_own ON public.coach_profiles;
DROP POLICY IF EXISTS coach_slots_own ON public.coach_slots;
DROP POLICY IF EXISTS coach_events_own ON public.coach_events;
DROP POLICY IF EXISTS coach_preferences_own ON public.coach_preferences;
DROP POLICY IF EXISTS coach_interviews_own ON public.coach_interviews;
DROP POLICY IF EXISTS coach_daily_own ON public.coach_daily;
DROP POLICY IF EXISTS coach_measurements_own ON public.coach_measurements;
DROP POLICY IF EXISTS coach_week_reviews_own ON public.coach_week_reviews;

CREATE POLICY coach_profiles_own ON public.coach_profiles FOR ALL
  USING (auth.uid()::text = user_id::text) WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY coach_slots_own ON public.coach_slots FOR ALL
  USING (auth.uid()::text = user_id::text) WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY coach_events_own ON public.coach_events FOR ALL
  USING (auth.uid()::text = user_id::text) WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY coach_preferences_own ON public.coach_preferences FOR ALL
  USING (auth.uid()::text = user_id::text) WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY coach_interviews_own ON public.coach_interviews FOR ALL
  USING (auth.uid()::text = user_id::text) WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY coach_daily_own ON public.coach_daily FOR ALL
  USING (auth.uid()::text = user_id::text) WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY coach_measurements_own ON public.coach_measurements FOR ALL
  USING (auth.uid()::text = user_id::text) WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY coach_week_reviews_own ON public.coach_week_reviews FOR ALL
  USING (auth.uid()::text = user_id::text) WITH CHECK (auth.uid()::text = user_id::text);

INSERT INTO storage.buckets (id, name, public)
VALUES ('meal-photos', 'meal-photos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "meal_photos_public_read" ON storage.objects;
DROP POLICY IF EXISTS "meal_photos_own_write" ON storage.objects;

CREATE POLICY "meal_photos_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'meal-photos');

CREATE POLICY "meal_photos_own_write"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'meal-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
