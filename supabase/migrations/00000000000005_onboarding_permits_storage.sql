-- =============================================================================
-- FOREIGNERS HUB: ONBOARDING, RESIDENCE PERMITS & DOCUMENT STORAGE
-- =============================================================================

-- 1. Profiles: Store residence permit URLs
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS residence_permit_front_url TEXT,
ADD COLUMN IF NOT EXISTS residence_permit_back_url TEXT;

-- 2. Payments: Store uploaded payment receipt URL
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS receipt_url TEXT;

-- 3. Rentals: Support historical/existing rentals onboarding
ALTER TABLE rentals
ADD COLUMN IF NOT EXISTS is_existing_rental BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMPTZ;

-- 4. Create "documents" storage bucket for permits, contracts, and receipts
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies for documents
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Public read documents'
  ) THEN
    CREATE POLICY "Public read documents"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'documents');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Allow upload documents'
  ) THEN
    CREATE POLICY "Allow upload documents"
    ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'documents');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Allow update documents'
  ) THEN
    CREATE POLICY "Allow update documents"
    ON storage.objects
    FOR UPDATE
    USING (bucket_id = 'documents')
    WITH CHECK (bucket_id = 'documents');
  END IF;
END $$;
