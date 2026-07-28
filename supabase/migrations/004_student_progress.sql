-- ============================================================
-- Migration: 004_student_progress
-- Description: Table for subjective student progress tracking per activity
-- ============================================================

CREATE TABLE public.activity_student_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  notes TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(activity_id, student_id)
);

-- Index for faster queries
CREATE INDEX idx_student_progress_activity ON public.activity_student_progress(activity_id);
CREATE INDEX idx_student_progress_student ON public.activity_student_progress(student_id);

-- Trigger for updated_at
CREATE TRIGGER trigger_student_progress_updated_at
  BEFORE UPDATE ON public.activity_student_progress
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE public.activity_student_progress ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Progress: admins can manage all"
  ON public.activity_student_progress FOR ALL
  USING (public.get_user_role() = 'ADMIN');

-- Teachers can manage progress for activities they own
CREATE POLICY "Progress: teachers can manage own activity progress"
  ON public.activity_student_progress FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.activities a 
      WHERE a.id = activity_student_progress.activity_id 
      AND a.teacher_id = public.get_teacher_id()
    )
  );

-- Parents can read progress for their own children
CREATE POLICY "Progress: parents can read own children progress"
  ON public.activity_student_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.students s 
      WHERE s.id = activity_student_progress.student_id 
      AND s.parent_id = public.get_parent_id()
    )
  );
