-- =============================================================================
-- FOREIGNERS HUB: BIKE IMAGE STORAGE
-- =============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'bike-images',
  'bike-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Public read bike images'
  ) THEN
    CREATE POLICY "Public read bike images"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'bike-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Admins upload bike images'
  ) THEN
    CREATE POLICY "Admins upload bike images"
    ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'bike-images' AND is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Admins update bike images'
  ) THEN
    CREATE POLICY "Admins update bike images"
    ON storage.objects
    FOR UPDATE
    USING (bucket_id = 'bike-images' AND is_admin())
    WITH CHECK (bucket_id = 'bike-images' AND is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Admins delete bike images'
  ) THEN
    CREATE POLICY "Admins delete bike images"
    ON storage.objects
    FOR DELETE
    USING (bucket_id = 'bike-images' AND is_admin());
  END IF;
END $$;
