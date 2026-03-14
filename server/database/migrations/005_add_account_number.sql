-- Migration 005: Add account_number field to object_card
-- account_number is a 27-digit number string (e.g., 401210860262877039806179006)

ALTER TABLE object_card ADD COLUMN IF NOT EXISTS account_number VARCHAR(27);
