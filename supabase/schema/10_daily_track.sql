-- =============================================================================
-- 10_daily_track.sql
-- Paste AFTER 04_progress_tracking.sql
-- Optional snapshot: one row per user per day with the same totals daily logging uses.
-- Charts still compute from meal_logs + workout_logs, so they stay correct without this table.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.daily_track_days (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  calories INTEGER NOT NULL DEFAULT 0,
  protein_g NUMERIC(8,1) NOT NULL DEFAULT 0,
  meals_count INTEGER NOT NULL DEFAULT 0,
  plan_meals_count INTEGER NOT NULL DEFAULT 0,
  workout_logged BOOLEAN NOT NULL DEFAULT false,
  workouts INTEGER NOT NULL DEFAULT 0,
  workout_kcal INTEGER NOT NULL DEFAULT 0,
  workout_minutes INTEGER NOT NULL DEFAULT 0,
  sets_completed INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_track_days_user_date
  ON public.daily_track_days(user_id, date);

ALTER TABLE public.daily_track_days ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS daily_track_days_own ON public.daily_track_days;
CREATE POLICY daily_track_days_own ON public.daily_track_days FOR ALL
  USING (auth.uid()::text = user_id::text) WITH CHECK (auth.uid()::text = user_id::text);

-- One plan check-off per meal slot per day (toggle stays clean).
CREATE UNIQUE INDEX IF NOT EXISTS meal_logs_one_plan_slot
  ON public.meal_logs (user_id, date, meal_slot)
  WHERE source_type = 'plan_checkoff';
