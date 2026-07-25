-- ============================================================
-- JURNAL TK - Phase 6 Mock Mode Fix
-- Run this in Supabase SQL Editor to allow mock users
-- ============================================================

-- Drop the foreign key constraint that requires public.users.id to be in auth.users
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Now you can insert mock users directly into public.users
