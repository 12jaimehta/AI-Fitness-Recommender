-- =============================================================================
-- 09_user_coaching.sql
-- Paste AFTER: 04_progress_tracking.sql
-- Long-term coaching memory: plateau checks, diet/workout advice, user notes.
-- Safe to re-run.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.user_coaching_memory (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  facts JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_advice JSONB,
  last_advice_at TIMESTAMPTZ,
  fingerprint TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_coaching_advice (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  plateau_flags TEXT[] NOT NULL DEFAULT '{}',
  diet_plan_id TEXT,
  workout_plan_id TEXT,
  advice JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_coaching_advice_user
  ON public.user_coaching_advice(user_id, created_at DESC);

DROP TRIGGER IF EXISTS update_user_coaching_memory_updated_at ON public.user_coaching_memory;
CREATE TRIGGER update_user_coaching_memory_updated_at
  BEFORE UPDATE ON public.user_coaching_memory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.user_coaching_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_coaching_advice ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_coaching_memory_own ON public.user_coaching_memory;
DROP POLICY IF EXISTS user_coaching_advice_own ON public.user_coaching_advice;

CREATE POLICY user_coaching_memory_own ON public.user_coaching_memory FOR ALL
  USING (auth.uid()::text = user_id::text) WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY user_coaching_advice_own ON public.user_coaching_advice FOR ALL
  USING (auth.uid()::text = user_id::text) WITH CHECK (auth.uid()::text = user_id::text);
