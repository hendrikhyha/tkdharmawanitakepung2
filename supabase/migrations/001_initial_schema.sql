-- ============================================================
-- JURNAL TK - DHARMA WANITA KEPUNG 2
-- Database Migration: Phase 3 - Database Design
-- ============================================================
-- INSTRUCTIONS:
--   1. Open your Supabase project dashboard
--   2. Go to SQL Editor
--   3. Paste this entire file and click "Run"
-- ============================================================


-- ============================================================
-- STEP 1: EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
-- STEP 2: ENUMS
-- ============================================================

CREATE TYPE public.user_role AS ENUM ('ADMIN', 'TEACHER', 'PARENT');

CREATE TYPE public.activity_status AS ENUM ('DRAFT', 'PUBLISHED');


-- ============================================================
-- STEP 3: TABLES
-- ============================================================

-- users: Extended profile linked to Supabase Auth
CREATE TABLE public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  role        public.user_role NOT NULL DEFAULT 'PARENT',
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- teachers: Extra info for teacher users
CREATE TABLE public.teachers (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  phone       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- parents: Extra info for parent users
CREATE TABLE public.parents (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  phone       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- academic_years: Track school years
CREATE TABLE public.academic_years (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,           -- e.g. "2025/2026"
  is_active   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- classes: A class is assigned to one teacher
CREATE TABLE public.classes (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              TEXT NOT NULL,           -- e.g. "Kelas A", "Kelas B"
  teacher_id        UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
  academic_year_id  UUID REFERENCES public.academic_years(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- students: Each student belongs to a class and has a parent
CREATE TABLE public.students (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  class_id    UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  parent_id   UUID REFERENCES public.parents(id) ON DELETE SET NULL,
  birth_date  DATE,
  photo       TEXT,                -- URL from Supabase Storage
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- activities: Daily activity reports created by teachers
CREATE TABLE public.activities (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id      UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  class_id        UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  activity_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  activity_time   TIME,                -- e.g. '07:00', '08:00'
  status          public.activity_status NOT NULL DEFAULT 'DRAFT',
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- activity_photos: Photos for an activity (max 5 per activity)
CREATE TABLE public.activity_photos (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id   UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  image_url     TEXT NOT NULL,          -- URL from Supabase Storage
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- STEP 4: INDEXES
-- ============================================================

CREATE INDEX idx_students_class_id     ON public.students(class_id);
CREATE INDEX idx_students_parent_id    ON public.students(parent_id);
CREATE INDEX idx_classes_teacher_id    ON public.classes(teacher_id);
CREATE INDEX idx_activities_class_id   ON public.activities(class_id);
CREATE INDEX idx_activities_teacher_id ON public.activities(teacher_id);
CREATE INDEX idx_activities_date       ON public.activities(activity_date);
CREATE INDEX idx_activity_photos_act   ON public.activity_photos(activity_id);


-- ============================================================
-- STEP 5: AUTO-UPDATE updated_at TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_activities_updated_at
  BEFORE UPDATE ON public.activities
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ============================================================
-- STEP 6: AUTO-CREATE USER PROFILE ON AUTH SIGNUP
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'PARENT')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- STEP 7: ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parents         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_years  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_photos ENABLE ROW LEVEL SECURITY;

-- Helper function: get the role of the current user
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS public.user_role AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: get the teacher id of the current user
CREATE OR REPLACE FUNCTION public.get_teacher_id()
RETURNS UUID AS $$
  SELECT id FROM public.teachers WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: get the parent id of the current user
CREATE OR REPLACE FUNCTION public.get_parent_id()
RETURNS UUID AS $$
  SELECT id FROM public.parents WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ---- USERS ----
CREATE POLICY "Users: admins can manage all"
  ON public.users FOR ALL
  USING (public.get_user_role() = 'ADMIN');

CREATE POLICY "Users: users can read own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users: users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- ---- TEACHERS ----
CREATE POLICY "Teachers: admins can manage all"
  ON public.teachers FOR ALL
  USING (public.get_user_role() = 'ADMIN');

CREATE POLICY "Teachers: teachers can read own record"
  ON public.teachers FOR SELECT
  USING (user_id = auth.uid() OR public.get_user_role() = 'ADMIN');

-- ---- PARENTS ----
CREATE POLICY "Parents: admins can manage all"
  ON public.parents FOR ALL
  USING (public.get_user_role() = 'ADMIN');

CREATE POLICY "Parents: parents can read own record"
  ON public.parents FOR SELECT
  USING (user_id = auth.uid() OR public.get_user_role() = 'ADMIN');

-- ---- ACADEMIC YEARS ----
CREATE POLICY "Academic Years: readable by all authenticated"
  ON public.academic_years FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Academic Years: admins can manage"
  ON public.academic_years FOR ALL
  USING (public.get_user_role() = 'ADMIN');

-- ---- CLASSES ----
CREATE POLICY "Classes: readable by all authenticated"
  ON public.classes FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Classes: admins can manage all"
  ON public.classes FOR ALL
  USING (public.get_user_role() = 'ADMIN');

CREATE POLICY "Classes: teachers can manage own class"
  ON public.classes FOR ALL
  USING (teacher_id = public.get_teacher_id());

-- ---- STUDENTS ----
CREATE POLICY "Students: admins can manage all"
  ON public.students FOR ALL
  USING (public.get_user_role() = 'ADMIN');

CREATE POLICY "Students: teachers can read students in own class"
  ON public.students FOR SELECT
  USING (
    public.get_user_role() = 'TEACHER' AND
    class_id IN (SELECT id FROM public.classes WHERE teacher_id = public.get_teacher_id())
  );

CREATE POLICY "Students: parents can read own children"
  ON public.students FOR SELECT
  USING (parent_id = public.get_parent_id());

-- ---- ACTIVITIES ----
CREATE POLICY "Activities: admins can manage all"
  ON public.activities FOR ALL
  USING (public.get_user_role() = 'ADMIN');

CREATE POLICY "Activities: teachers can manage own activities"
  ON public.activities FOR ALL
  USING (teacher_id = public.get_teacher_id());

CREATE POLICY "Activities: parents can read published activities for own children's class"
  ON public.activities FOR SELECT
  USING (
    status = 'PUBLISHED' AND
    class_id IN (
      SELECT class_id FROM public.students WHERE parent_id = public.get_parent_id()
    )
  );

-- ---- ACTIVITY PHOTOS ----
CREATE POLICY "Activity Photos: admins can manage all"
  ON public.activity_photos FOR ALL
  USING (public.get_user_role() = 'ADMIN');

CREATE POLICY "Activity Photos: teachers can manage photos of own activities"
  ON public.activity_photos FOR ALL
  USING (
    activity_id IN (
      SELECT id FROM public.activities WHERE teacher_id = public.get_teacher_id()
    )
  );

CREATE POLICY "Activity Photos: parents can read photos of published activities for own children's class"
  ON public.activity_photos FOR SELECT
  USING (
    activity_id IN (
      SELECT a.id FROM public.activities a
      JOIN public.students s ON s.class_id = a.class_id
      WHERE s.parent_id = public.get_parent_id() AND a.status = 'PUBLISHED'
    )
  );


-- ============================================================
-- STEP 8: SEED DATA (for testing)
-- ============================================================

-- NOTE: This seed data creates records in the public.users table only.
-- Actual auth.users records must be created via Supabase Auth (signup).
-- The trigger handle_new_user() will auto-create entries in public.users.

-- Academic Year
INSERT INTO public.academic_years (name, is_active)
VALUES ('2025/2026', TRUE);

-- ============================================================
-- END OF MIGRATION
-- Run this in Supabase SQL Editor.
-- ============================================================
