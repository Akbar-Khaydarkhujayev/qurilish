-- Migration: Add state_commission table for "Гос. комиссия хулосаси" tab
CREATE TABLE IF NOT EXISTS state_commission (
    id SERIAL PRIMARY KEY,
    object_card_id INTEGER NOT NULL REFERENCES object_card(id) ON DELETE CASCADE,
    document_number VARCHAR(255),
    document_date DATE,
    comment TEXT,
    pdf_file_path TEXT,
    pdf_file_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_state_commission_object_card
    ON state_commission(object_card_id) WHERE is_deleted = FALSE;
