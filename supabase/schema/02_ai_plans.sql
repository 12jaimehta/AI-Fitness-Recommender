-- =============================================================================
-- 02_ai_plans.sql
-- Paste AFTER: 01_user_profiles.sql
-- Saved AI diet + workout plans used by /diet, /workout, and /progress.
-- Safe to re-run. Drops old policies first so user_id can be converted to UUID.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.diet_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  form_data JSONB NOT NULL,
  diet_plan JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  form_data JSONB NOT NULL,
  workout_plan JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Drop every policy on these tables (old names like "Users can view own diet plans"
-- block ALTER COLUMN user_id TYPE uuid).
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('diet_plans', 'workout_plans')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- Convert leftover TEXT user_id from older dumps.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'diet_plans'
      AND column_name = 'user_id' AND udt_name = 'text'
  ) THEN
    ALTER TABLE public.diet_plans DROP CONSTRAINT IF EXISTS diet_plans_user_id_fkey;
    ALTER TABLE public.diet_plans
      ALTER COLUMN user_id TYPE UUID USING NULLIF(trim(user_id), '')::uuid;
    ALTER TABLE public.diet_plans
      ADD CONSTRAINT diet_plans_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'workout_plans'
      AND column_name = 'user_id' AND udt_name = 'text'
  ) THEN
    ALTER TABLE public.workout_plans DROP CONSTRAINT IF EXISTS workout_plans_user_id_fkey;
    ALTER TABLE public.workout_plans
      ALTER COLUMN user_id TYPE UUID USING NULLIF(trim(user_id), '')::uuid;
    ALTER TABLE public.workout_plans
      ADD CONSTRAINT workout_plans_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_diet_plans_user_id ON public.diet_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_diet_plans_created_at ON public.diet_plans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workout_plans_user_id ON public.workout_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_plans_created_at ON public.workout_plans(created_at DESC);

DROP TRIGGER IF EXISTS update_diet_plans_updated_at ON public.diet_plans;
CREATE TRIGGER update_diet_plans_updated_at
  BEFORE UPDATE ON public.diet_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_workout_plans_updated_at ON public.workout_plans;
CREATE TRIGGER update_workout_plans_updated_at
  BEFORE UPDATE ON public.workout_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "diet_plans_own"
  ON public.diet_plans FOR ALL
  USING (auth.uid()::text = user_id::text) WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "workout_plans_own"
  ON public.workout_plans FOR ALL
  USING (auth.uid()::text = user_id::text) WITH CHECK (auth.uid()::text = user_id::text);
