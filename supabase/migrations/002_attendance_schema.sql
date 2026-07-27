-- ============================================================
-- JURNAL TK - DHARMA WANITA KEPUNG 2
-- Database Migration: Phase 4 - Attendance Feature
-- ============================================================

-- 1. Create Enum for Attendance Status
CREATE TYPE public.attendance_status AS ENUM ('PRESENT', 'SICK', 'EXCUSED', 'ABSENT');

-- 2. Create attendances table
CREATE TABLE public.attendances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status public.attendance_status NOT NULL DEFAULT 'PRESENT',
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, date)
);

-- 3. Create Indexes
CREATE INDEX idx_attendances_class_id ON public.attendances(class_id);
CREATE INDEX idx_attendances_student_id ON public.attendances(student_id);
CREATE INDEX idx_attendances_date ON public.attendances(date);

-- 4. Trigger for updated_at
CREATE TRIGGER trigger_attendances_updated_at
  BEFORE UPDATE ON public.attendances
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 5. Enable RLS
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;

-- Admins can manage all
CREATE POLICY "Attendances: admins can manage all"
  ON public.attendances FOR ALL
  USING (public.get_user_role() = 'ADMIN');

-- Teachers can manage their own class attendance
CREATE POLICY "Attendances: teachers can manage own class"
  ON public.attendances FOR ALL
  USING (
    teacher_id = public.get_teacher_id()
  )
  WITH CHECK (
    teacher_id = public.get_teacher_id()
  );

-- Parents can view attendance of their own children
CREATE POLICY "Attendances: parents can view own children"
  ON public.attendances FOR SELECT
  USING (
    student_id IN (SELECT id FROM public.students WHERE parent_id = public.get_parent_id())
  );
