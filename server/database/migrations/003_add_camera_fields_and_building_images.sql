-- Migration: Add camera stream fields to object_card and building_images table
-- Date: 2026-02-14

-- Add camera stream fields to object_card
ALTER TABLE object_card
ADD COLUMN IF NOT EXISTS camera_login VARCHAR(100),
ADD COLUMN IF NOT EXISTS camera_password VARCHAR(100),
ADD COLUMN IF NOT EXISTS camera_ip VARCHAR(255);

-- Create building_images table for carousel photos
CREATE TABLE IF NOT EXISTS building_images (
    id SERIAL PRIMARY KEY,
    object_card_id INTEGER NOT NULL REFERENCES object_card(id) ON DELETE CASCADE,
    path TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_building_images_object_card_id
ON building_images(object_card_id) WHERE is_deleted = FALSE;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration 003: camera fields and building_images table created successfully';
END $$;
