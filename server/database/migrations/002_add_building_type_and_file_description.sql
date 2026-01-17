-- Migration: Add building_type to object_card and description to files
-- Date: 2026-01-16

-- Add building_type column to object_card table
ALTER TABLE object_card
ADD COLUMN IF NOT EXISTS building_type VARCHAR(50) DEFAULT 'new_building';

-- Add constraint for building_type (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_building_type'
    ) THEN
        ALTER TABLE object_card
        ADD CONSTRAINT check_building_type
        CHECK (building_type IN ('new_building', 'major_renovation'));
    END IF;
END $$;

-- Add description column to files table
ALTER TABLE files
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add stage column to object_contract table
ALTER TABLE object_contract
ADD COLUMN IF NOT EXISTS stage VARCHAR(255);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration 002 completed: Added building_type to object_card, description to files, and stage to object_contract';
END $$;
