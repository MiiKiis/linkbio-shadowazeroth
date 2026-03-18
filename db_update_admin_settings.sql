-- Migration: Add missing fields to admin_settings table
ALTER TABLE admin_settings
  ADD COLUMN avatar_url TEXT,
  ADD COLUMN server_status TEXT,
  ADD COLUMN footer_text TEXT,
  ADD COLUMN background_url TEXT,
  ADD COLUMN particle_color_1 TEXT,
  ADD COLUMN particle_color_2 TEXT;
