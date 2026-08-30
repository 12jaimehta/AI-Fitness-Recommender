-- =============================================================================
-- 06_storage.sql
-- Paste AFTER: 00_extensions_and_helpers.sql
-- Photo buckets for progress shots and trainer avatars.
-- Skip if you are not using photos yet.
-- =============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('progress-photos', 'progress-photos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('trainer-avatars', 'trainer-avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "progress_photos_public_read" ON storage.objects;
DROP POLICY IF EXISTS "progress_photos_own_write" ON storage.objects;
DROP POLICY IF EXISTS "trainer_avatars_public_read" ON storage.objects;
DROP POLICY IF EXISTS "trainer_avatars_own_write" ON storage.objects;

CREATE POLICY "progress_photos_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'progress-photos');

CREATE POLICY "progress_photos_own_write"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'progress-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "trainer_avatars_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'trainer-avatars');

CREATE POLICY "trainer_avatars_own_write"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'trainer-avatars'
    AND auth.role() = 'authenticated'
  );
