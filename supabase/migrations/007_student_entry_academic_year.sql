-- ============================================================
-- Migration: 007_student_entry_academic_year
-- Description: Add entry_academic_year_id to students table
-- ============================================================

-- Step 1: Add the new column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='students' AND column_name='entry_academic_year_id') THEN
        ALTER TABLE public.students ADD COLUMN entry_academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE SET NULL;
    END IF;
END
$$;

-- Step 2: Create an index for the new column
CREATE INDEX IF NOT EXISTS idx_students_entry_academic_year_id ON public.students(entry_academic_year_id);
