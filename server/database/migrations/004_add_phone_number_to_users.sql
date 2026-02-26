-- Migration 004: Add phone_number to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50);
