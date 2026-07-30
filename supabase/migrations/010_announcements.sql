-- ============================================================
-- JURNAL TK - DHARMA WANITA KEPUNG 2
-- Database Migration: Phase 10 - Announcements
-- ============================================================

-- 1. Create the 'announcement_images' table
CREATE TABLE IF NOT EXISTS public.announcement_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    uploaded_by UUID REFERENCES auth.users(id) NOT NULL
);

-- Enable RLS
ALTER TABLE public.announcement_images ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if running multiple times
DROP POLICY IF EXISTS "Announcements are viewable by all authenticated users" ON public.announcement_images;
DROP POLICY IF EXISTS "Teachers can insert announcements" ON public.announcement_images;
DROP POLICY IF EXISTS "Teachers can delete announcements" ON public.announcement_images;

-- Select Policy (Everyone can view)
CREATE POLICY "Announcements are viewable by all authenticated users"
ON public.announcement_images
FOR SELECT
TO authenticated
USING (true);

-- Insert Policy (Only teachers can upload)
CREATE POLICY "Teachers can insert announcements"
ON public.announcement_images
FOR INSERT
TO authenticated
WITH CHECK (public.get_user_role() = 'TEACHER' OR public.get_user_role() = 'ADMIN');

-- Delete Policy (Only teachers can delete)
CREATE POLICY "Teachers can delete announcements"
ON public.announcement_images
FOR DELETE
TO authenticated
USING (public.get_user_role() = 'TEACHER' OR public.get_user_role() = 'ADMIN');

-- ============================================================
-- 2. Create the 'announcements' bucket
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'announcements',
  'announcements',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 3. Drop existing policies to be idempotent
DROP POLICY IF EXISTS "Public Announcements are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can insert announcements images" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can delete announcements images" ON storage.objects;

-- 4. Create RLS Policies for the bucket
-- Allow public viewing of announcement images
CREATE POLICY "Public Announcements are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'announcements');

-- Allow authenticated teachers to upload files
CREATE POLICY "Teachers can insert announcements images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'announcements' 
  AND (public.get_user_role() = 'TEACHER' OR public.get_user_role() = 'ADMIN')
);

-- Allow authenticated teachers to delete their files
CREATE POLICY "Teachers can delete announcements images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'announcements' 
  AND (public.get_user_role() = 'TEACHER' OR public.get_user_role() = 'ADMIN')
);
