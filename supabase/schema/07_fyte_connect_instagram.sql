-- =============================================================================
-- 07_fyte_connect_instagram.sql
-- Paste AFTER 05_fyte_connect.sql if you already ran 05 before Instagram existed.
-- Safe to re-run. Skip if you are pasting a fresh 05 that already has these columns.
-- =============================================================================

ALTER TABLE public.trainer_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.trainer_profiles ADD COLUMN IF NOT EXISTS instagram_handle TEXT;
ALTER TABLE public.creators ADD COLUMN IF NOT EXISTS instagram_handle TEXT; 
