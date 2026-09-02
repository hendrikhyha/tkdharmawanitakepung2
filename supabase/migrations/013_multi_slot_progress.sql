-- ============================================================
-- Migration: 013_multi_slot_progress
-- Description: Convert single notes/photo_url to multi-slot items array
-- ============================================================

-- Step 1: Add items column
ALTER TABLE public.activity_student_progress
ADD COLUMN items JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Step 2: Migrate existing data
UPDATE public.activity_student_progress
SET items = jsonb_build_array(
  jsonb_build_object(
    'notes', notes,
    'photo_url', photo_url
  )
)
WHERE (notes IS NOT NULL AND notes != '') OR photo_url IS NOT NULL;

-- Step 3: Drop old columns
ALTER TABLE public.activity_student_progress
DROP COLUMN notes,
DROP COLUMN photo_url;
