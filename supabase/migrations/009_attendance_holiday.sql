-- ============================================================
-- JURNAL TK - DHARMA WANITA KEPUNG 2
-- Migration: 009_attendance_holiday.sql
-- Description: Add HOLIDAY status to attendance_status enum
-- ============================================================

-- Add HOLIDAY to attendance_status enum if it doesn't exist
ALTER TYPE public.attendance_status ADD VALUE IF NOT EXISTS 'HOLIDAY';
