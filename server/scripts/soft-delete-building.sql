-- Soft-delete a building and all related data by id
-- Usage example:
-- psql -U postgres -d qurilish_db -v building_id=1 -f server/scripts/soft-delete-building.sql

\set ON_ERROR_STOP on

BEGIN;

-- Main building
UPDATE object_card
SET is_deleted = TRUE,
    updated_at = NOW()
WHERE id = :building_id
  AND is_deleted = FALSE;

-- Related records
UPDATE object_contract
SET is_deleted = TRUE,
    updated_at = NOW()
WHERE object_card_id = :building_id
  AND is_deleted = FALSE;

UPDATE object_estimate
SET is_deleted = TRUE,
    updated_at = NOW()
WHERE object_card_id = :building_id
  AND is_deleted = FALSE;

UPDATE sub_object_card
SET is_deleted = TRUE,
    updated_at = NOW()
WHERE object_card_id = :building_id
  AND is_deleted = FALSE;

UPDATE bank_expenses
SET is_deleted = TRUE,
    updated_at = NOW()
WHERE object_card_id = :building_id
  AND is_deleted = FALSE;

UPDATE invoices
SET is_deleted = TRUE,
    updated_at = NOW()
WHERE object_card_id = :building_id
  AND is_deleted = FALSE;

UPDATE files
SET is_deleted = TRUE,
    updated_at = NOW()
WHERE object_card_id = :building_id
  AND is_deleted = FALSE;

UPDATE building_images
SET is_deleted = TRUE
WHERE object_card_id = :building_id
  AND is_deleted = FALSE;

COMMIT;

-- Quick verification summary
SELECT
  (SELECT is_deleted FROM object_card WHERE id = :building_id) AS building_deleted,
  (SELECT COUNT(*) FROM object_contract WHERE object_card_id = :building_id AND is_deleted = FALSE) AS active_contracts,
  (SELECT COUNT(*) FROM object_estimate WHERE object_card_id = :building_id AND is_deleted = FALSE) AS active_estimates,
  (SELECT COUNT(*) FROM sub_object_card WHERE object_card_id = :building_id AND is_deleted = FALSE) AS active_sub_objects,
  (SELECT COUNT(*) FROM bank_expenses WHERE object_card_id = :building_id AND is_deleted = FALSE) AS active_expenses,
  (SELECT COUNT(*) FROM invoices WHERE object_card_id = :building_id AND is_deleted = FALSE) AS active_invoices,
  (SELECT COUNT(*) FROM files WHERE object_card_id = :building_id AND is_deleted = FALSE) AS active_files,
  (SELECT COUNT(*) FROM building_images WHERE object_card_id = :building_id AND is_deleted = FALSE) AS active_images;
