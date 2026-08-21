-- ============================================================
-- Migration: 012_multi_parent
-- Description: Many-to-many relationship between students and parents
--   - New junction table: student_parents
--   - Migrate existing parent_id data
--   - Update RLS policies to use student_parents
-- ============================================================

-- Step 1: Create junction table
CREATE TABLE public.student_parents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES public.parents(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, parent_id)
);

-- Indexes
CREATE INDEX idx_student_parents_student ON public.student_parents(student_id);
CREATE INDEX idx_student_parents_parent ON public.student_parents(parent_id);

-- Enable RLS
ALTER TABLE public.student_parents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for student_parents
CREATE POLICY "student_parents: admins can manage all"
  ON public.student_parents FOR ALL
  USING (public.get_user_role() = 'ADMIN');

CREATE POLICY "student_parents: teachers can read"
  ON public.student_parents FOR SELECT
  USING (public.get_user_role() = 'TEACHER');

CREATE POLICY "student_parents: parents can read own"
  ON public.student_parents FOR SELECT
  USING (parent_id = public.get_parent_id());


-- Step 2: Migrate existing data from students.parent_id
INSERT INTO public.student_parents (student_id, parent_id, is_primary)
SELECT id, parent_id, true
FROM public.students
WHERE parent_id IS NOT NULL
ON CONFLICT (student_id, parent_id) DO NOTHING;


-- Step 3: Helper function to get student IDs for the current parent
-- This replaces direct parent_id lookups throughout RLS policies
CREATE OR REPLACE FUNCTION public.get_parent_student_ids()
RETURNS SETOF UUID AS $$
  SELECT student_id FROM public.student_parents WHERE parent_id = public.get_parent_id();
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- Step 4: Update RLS policies for students table
-- Drop old parent policy
DROP POLICY IF EXISTS "Students: parents can read own children" ON public.students;

-- New parent policy using student_parents
CREATE POLICY "Students: parents can read own children"
  ON public.students FOR SELECT
  USING (id IN (SELECT public.get_parent_student_ids()));


-- Step 5: Update RLS policies for activities table
-- Drop old parent policy
DROP POLICY IF EXISTS "Activities: parents can read published activities for own children's class" ON public.activities;

-- New parent policy using student_parents
CREATE POLICY "Activities: parents can read published activities for own children's class"
  ON public.activities FOR SELECT
  USING (
    status = 'PUBLISHED' AND
    class_id IN (
      SELECT s.class_id FROM public.students s
      WHERE s.id IN (SELECT public.get_parent_student_ids())
    )
  );


-- Step 6: Update RLS policies for activity_photos table
-- Drop old parent policy
DROP POLICY IF EXISTS "Activity Photos: parents can read photos of published activities for own children's class" ON public.activity_photos;

-- New parent policy using student_parents
CREATE POLICY "Activity Photos: parents can read photos of published activities for own children's class"
  ON public.activity_photos FOR SELECT
  USING (
    activity_id IN (
      SELECT a.id FROM public.activities a
      JOIN public.students s ON s.class_id = a.class_id
      WHERE s.id IN (SELECT public.get_parent_student_ids())
      AND a.status = 'PUBLISHED'
    )
  );


-- Step 7: Update RLS policies for activity_student_progress table
-- Drop old parent policy
DROP POLICY IF EXISTS "Progress: parents can read own children progress" ON public.activity_student_progress;

-- New parent policy using student_parents
CREATE POLICY "Progress: parents can read own children progress"
  ON public.activity_student_progress FOR SELECT
  USING (
    student_id IN (SELECT public.get_parent_student_ids())
  );

-- ============================================================
-- END OF MIGRATION
-- ============================================================
