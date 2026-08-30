-- =============================================================================
-- 08_trainer_profile_columns.sql
-- Paste AFTER 05 (and 07 if you already ran it).
-- Adds missing trainer_profiles columns used by Become a trainer.
-- Safe to re-run. This is the file to paste if POST /api/connect/trainers
-- fails with "Could not find the 'avatar_url' column".
-- =============================================================================

ALTER TABLE public.trainer_profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.trainer_profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.trainer_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.trainer_profiles ADD COLUMN IF NOT EXISTS expertise TEXT[] DEFAULT '{}';
ALTER TABLE public.trainer_profiles ADD COLUMN IF NOT EXISTS experience_years INTEGER;
ALTER TABLE public.trainer_profiles ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC;
ALTER TABLE public.trainer_profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.trainer_profiles ADD COLUMN IF NOT EXISTS instagram_handle TEXT;
