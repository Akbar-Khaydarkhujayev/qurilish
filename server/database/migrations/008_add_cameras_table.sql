-- Migration: Add cameras table for multi-camera support per building
CREATE TABLE IF NOT EXISTS cameras (
    id SERIAL PRIMARY KEY,
    object_card_id INTEGER NOT NULL REFERENCES object_card(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL DEFAULT 'Camera',
    camera_ip VARCHAR(255) NOT NULL,
    camera_login VARCHAR(100) NOT NULL,
    camera_password VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_cameras_object_card ON cameras(object_card_id) WHERE is_deleted = FALSE;

-- Migrate existing camera credentials from object_card into the new cameras table
INSERT INTO cameras (object_card_id, name, camera_ip, camera_login, camera_password)
SELECT id, 'Camera 1', camera_ip, camera_login, camera_password
FROM object_card
WHERE is_deleted = FALSE
  AND camera_ip IS NOT NULL AND camera_ip != ''
  AND camera_login IS NOT NULL AND camera_login != ''
  AND camera_password IS NOT NULL AND camera_password != '';
