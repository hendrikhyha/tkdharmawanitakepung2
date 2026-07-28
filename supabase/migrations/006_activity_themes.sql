-- ============================================================
-- Migration: 006_activity_themes
-- Description: Replace title with theme and sub_theme
-- ============================================================

-- Step 1: Add new columns
ALTER TABLE public.activities
ADD COLUMN theme TEXT,
ADD COLUMN sub_theme TEXT;

-- Step 2: Migrate existing data
-- We copy the old 'title' to 'theme' so data is not lost.
UPDATE public.activities
SET theme = title,
    sub_theme = '-';

-- Step 3: Make theme NOT NULL
ALTER TABLE public.activities
ALTER COLUMN theme SET NOT NULL;

-- Step 4: Drop old title column
ALTER TABLE public.activities
DROP COLUMN title;
