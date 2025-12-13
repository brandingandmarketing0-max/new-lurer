-- Add exclusive_preview_image column to pages table
-- Run this in Supabase SQL Editor

ALTER TABLE public.pages 
ADD COLUMN IF NOT EXISTS exclusive_preview_image text;

