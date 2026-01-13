-- Database reset script
-- WARNING: This will delete all data in the database!

-- Drop all tables (add your tables here as you create them)
DROP TABLE IF EXISTS users CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop extensions (optional, but can be re-created)
DROP EXTENSION IF EXISTS "uuid-ossp";

-- Now you can run init.sql to recreate everything
-- psql -U postgres -d qurilish_db -f database/init.sql
