-- ============================================================
-- JURNAL TK - DHARMA WANITA KEPUNG 2
-- Database Migration: Phase 4 - Storage Profiles Bucket
-- ============================================================
-- INSTRUCTIONS:
--   1. Open your Supabase project dashboard
--   2. Go to SQL Editor
--   3. Paste this entire file and click "Run"
-- ============================================================

-- 1. Create the 'profiles' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profiles',
  'profiles',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Drop existing policies to be idempotent
DROP POLICY IF EXISTS "Public Profile Images are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Users can insert their own profile image" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile image" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile image" ON storage.objects;

-- 3. Create RLS Policies for the bucket
-- Allow public viewing of profile images
CREATE POLICY "Public Profile Images are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'profiles');

-- Allow authenticated users to upload files
CREATE POLICY "Users can insert their own profile image"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profiles' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their files
CREATE POLICY "Users can update their own profile image"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profiles' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their files
CREATE POLICY "Users can delete their own profile image"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profiles' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
