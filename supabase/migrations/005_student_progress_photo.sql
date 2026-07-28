-- ============================================================
-- Migration: 005_student_progress_photo
-- Description: Add photo_url to student progress
-- ============================================================

ALTER TABLE public.activity_student_progress
ADD COLUMN photo_url TEXT;
