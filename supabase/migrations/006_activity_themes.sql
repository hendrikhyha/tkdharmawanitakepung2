-- ============================================================
-- Migration: 006_activity_themes
-- Description: Replace title with theme and sub_theme
-- ============================================================

-- Step 1: Add new columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='activities' AND column_name='theme') THEN
        ALTER TABLE public.activities ADD COLUMN theme TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='activities' AND column_name='sub_theme') THEN
        ALTER TABLE public.activities ADD COLUMN sub_theme TEXT;
    END IF;
END
$$;

-- Step 2: Migrate existing data
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='activities' AND column_name='title') THEN
        UPDATE public.activities SET theme = title WHERE theme IS NULL;
        UPDATE public.activities SET sub_theme = '-' WHERE sub_theme IS NULL;
    END IF;
END
$$;

-- Step 3: Make theme NOT NULL (skip if already not null)
-- This is a bit complex in DO block, but we can just run it directly. If it's already NOT NULL it might throw an error but it's safe to run.
-- Let's just do it directly.
ALTER TABLE public.activities ALTER COLUMN theme SET NOT NULL;

-- Step 4: Drop old title column if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='activities' AND column_name='title') THEN
        ALTER TABLE public.activities DROP COLUMN title;
    END IF;
END
$$;
