-- ============================================================
-- JURNAL TK - DHARMA WANITA KEPUNG 2
-- Migration: 008_add_assistant_teacher.sql
-- Description: Add assistant_teacher_id to classes table & update RLS policies
-- ============================================================

-- 1. Add assistant_teacher_id column to classes table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'classes' AND column_name = 'assistant_teacher_id'
    ) THEN
        ALTER TABLE public.classes 
        ADD COLUMN assistant_teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL;
    END IF;
END$$;

-- 2. Create index for assistant_teacher_id
CREATE INDEX IF NOT EXISTS idx_classes_assistant_teacher_id ON public.classes(assistant_teacher_id);

-- 3. Update RLS Policies for Classes
DROP POLICY IF EXISTS "Classes: teachers can manage own class" ON public.classes;
CREATE POLICY "Classes: teachers can manage own class"
  ON public.classes FOR ALL
  USING (
    teacher_id = public.get_teacher_id() OR 
    assistant_teacher_id = public.get_teacher_id()
  );

-- 4. Update RLS Policies for Students
DROP POLICY IF EXISTS "Students: teachers can read students in own class" ON public.students;
CREATE POLICY "Students: teachers can read students in own class"
  ON public.students FOR SELECT
  USING (
    public.get_user_role() = 'TEACHER' AND
    class_id IN (
      SELECT id FROM public.classes 
      WHERE teacher_id = public.get_teacher_id() OR assistant_teacher_id = public.get_teacher_id()
    )
  );

-- 5. Update RLS Policies for Activities
DROP POLICY IF EXISTS "Activities: teachers can manage own activities" ON public.activities;
CREATE POLICY "Activities: teachers can manage own activities"
  ON public.activities FOR ALL
  USING (
    teacher_id = public.get_teacher_id() OR
    class_id IN (
      SELECT id FROM public.classes 
      WHERE teacher_id = public.get_teacher_id() OR assistant_teacher_id = public.get_teacher_id()
    )
  );

-- 6. Update RLS Policies for Activity Photos
DROP POLICY IF EXISTS "Activity Photos: teachers can manage photos of own activities" ON public.activity_photos;
CREATE POLICY "Activity Photos: teachers can manage photos of own activities"
  ON public.activity_photos FOR ALL
  USING (
    activity_id IN (
      SELECT id FROM public.activities 
      WHERE teacher_id = public.get_teacher_id() OR class_id IN (
        SELECT id FROM public.classes 
        WHERE teacher_id = public.get_teacher_id() OR assistant_teacher_id = public.get_teacher_id()
      )
    )
  );

-- 7. Update RLS Policies for Attendances
DROP POLICY IF EXISTS "Attendances: teachers can manage own class" ON public.attendances;
CREATE POLICY "Attendances: teachers can manage own class"
  ON public.attendances FOR ALL
  USING (
    teacher_id = public.get_teacher_id() OR
    class_id IN (
      SELECT id FROM public.classes 
      WHERE teacher_id = public.get_teacher_id() OR assistant_teacher_id = public.get_teacher_id()
    )
  )
  WITH CHECK (
    teacher_id = public.get_teacher_id() OR
    class_id IN (
      SELECT id FROM public.classes 
      WHERE teacher_id = public.get_teacher_id() OR assistant_teacher_id = public.get_teacher_id()
    )
  );

-- 8. Update RLS Policies for Student Progress
DROP POLICY IF EXISTS "Progress: teachers can manage own activity progress" ON public.activity_student_progress;
CREATE POLICY "Progress: teachers can manage own activity progress"
  ON public.activity_student_progress FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.activities a 
      WHERE a.id = activity_student_progress.activity_id 
      AND (
        a.teacher_id = public.get_teacher_id() OR
        a.class_id IN (
          SELECT id FROM public.classes 
          WHERE teacher_id = public.get_teacher_id() OR assistant_teacher_id = public.get_teacher_id()
        )
      )
    )
  );
