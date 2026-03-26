-- Migration: Add jshshir (ПИНФЛ) field to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS jshshir VARCHAR(14);
