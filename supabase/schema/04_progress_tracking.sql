-- =============================================================================
-- 04_progress_tracking.sql
-- Paste AFTER: 02_ai_plans.sql and 03_personal_fitness.sql
-- Current /progress module: 1-tap meals, set logging, vitals, weekly review.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.daily_progress_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight_kg NUMERIC(5,2),
  water_intake_ml INTEGER DEFAULT 0,
  sleep_hours NUMERIC(3,1),
  energy_rating INTEGER CHECK (energy_rating BETWEEN 1 AND 5),
  mood_rating INTEGER CHECK (mood_rating BETWEEN 1 AND 5),
  notes TEXT,
  ai_daily_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, date)
);

CREATE TABLE IF NOT EXISTS public.meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meal_slot VARCHAR(30) NOT NULL,
  source_type VARCHAR(20) NOT NULL CHECK (source_type IN ('plan_checkoff', 'ai_text', 'ai_vision', 'manual')),
  meal_name VARCHAR(255) NOT NULL,
  items JSONB DEFAULT '[]'::jsonb,
  total_calories INTEGER NOT NULL DEFAULT 0,
  total_protein_g NUMERIC(6,1) DEFAULT 0,
  total_carbs_g NUMERIC(6,1) DEFAULT 0,
  total_fat_g NUMERIC(6,1) DEFAULT 0,
  is_plan_compliant BOOLEAN DEFAULT true,
  photo_url TEXT,
  ai_confidence_score NUMERIC(3,2),
  ai_explanation TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  workout_plan_id UUID REFERENCES public.workout_plans(id) ON DELETE SET NULL,
  source_type VARCHAR(20) NOT NULL CHECK (source_type IN ('plan_checkoff', 'ai_text', 'manual')),
  title VARCHAR(255) NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 45,
  rpe_rating INTEGER CHECK (rpe_rating BETWEEN 1 AND 10),
  calories_burned_estimated INTEGER,
  exercises_completed JSONB DEFAULT '[]'::jsonb,
  is_completed BOOLEAN DEFAULT true,
  notes TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, date)
);

CREATE TABLE IF NOT EXISTS public.ai_weekly_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  avg_calories_adherence_pct NUMERIC(5,2),
  workouts_completed_count INTEGER,
  workouts_target_count INTEGER,
  weight_delta_kg NUMERIC(4,2),
  ai_status VARCHAR(30) CHECK (ai_status IN ('on_track', 'slight_stall', 'needs_adjustment', 'surpassing_target')),
  ai_feedback_summary TEXT NOT NULL,
  ai_action_items JSONB DEFAULT '[]'::jsonb,
  recommended_plan_modifications JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, week_start_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_progress_user_date ON public.daily_progress_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_meal_logs_user_date ON public.meal_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_workout_logs_user_date ON public.workout_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_ai_weekly_reviews_user ON public.ai_weekly_reviews(user_id, week_start_date DESC);

DROP TRIGGER IF EXISTS update_daily_progress_logs_updated_at ON public.daily_progress_logs;
CREATE TRIGGER update_daily_progress_logs_updated_at
  BEFORE UPDATE ON public.daily_progress_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.daily_progress_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_weekly_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS daily_progress_logs_own ON public.daily_progress_logs;
DROP POLICY IF EXISTS meal_logs_own ON public.meal_logs;
DROP POLICY IF EXISTS workout_logs_own ON public.workout_logs;
DROP POLICY IF EXISTS ai_weekly_reviews_own ON public.ai_weekly_reviews;

CREATE POLICY daily_progress_logs_own ON public.daily_progress_logs FOR ALL
  USING (auth.uid()::text = user_id::text) WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY meal_logs_own ON public.meal_logs FOR ALL
  USING (auth.uid()::text = user_id::text) WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY workout_logs_own ON public.workout_logs FOR ALL
  USING (auth.uid()::text = user_id::text) WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY ai_weekly_reviews_own ON public.ai_weekly_reviews FOR ALL
  USING (auth.uid()::text = user_id::text) WITH CHECK (auth.uid()::text = user_id::text);
