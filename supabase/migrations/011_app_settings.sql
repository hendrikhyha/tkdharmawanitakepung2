-- ============================================================
-- JURNAL TK - DHARMA WANITA KEPUNG 2
-- Database Migration: Phase 11 - App Settings
-- ============================================================

CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Admins can manage all settings
CREATE POLICY "Settings: admins can manage all"
    ON public.app_settings FOR ALL
    USING (public.get_user_role() = 'ADMIN');

-- Anyone authenticated can view settings (for UI behavior)
CREATE POLICY "Settings: everyone can view"
    ON public.app_settings FOR SELECT
    TO authenticated
    USING (true);

-- Insert default settings
INSERT INTO public.app_settings (key, value, description)
VALUES 
    ('strict_notifications', 'true'::jsonb, 'Jika true, guru tidak dapat menutup (dismiss) notifikasi tugas wajib hingga tugas dikerjakan.')
ON CONFLICT (key) DO NOTHING;
