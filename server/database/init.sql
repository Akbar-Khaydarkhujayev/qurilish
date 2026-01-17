-- Qurilish Database Schema
-- Construction Management System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS files CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS bank_expenses CASCADE;
DROP TABLE IF EXISTS sub_object_card_item CASCADE;
DROP TABLE IF EXISTS sub_object_card CASCADE;
DROP TABLE IF EXISTS object_estimate CASCADE;
DROP TABLE IF EXISTS object_contract CASCADE;
DROP TABLE IF EXISTS object_card CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS districts CASCADE;
DROP TABLE IF EXISTS regions CASCADE;
DROP TABLE IF EXISTS project_organization CASCADE;
DROP TABLE IF EXISTS contractor CASCADE;
DROP TABLE IF EXISTS construction_status CASCADE;
DROP TABLE IF EXISTS construction_items CASCADE;

-- Create regions table (viloyat)
CREATE TABLE regions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Create districts table (tuman)
CREATE TABLE districts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    region_id INTEGER NOT NULL REFERENCES regions(id) ON DELETE RESTRICT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Create project_organization table (loyiha_tashkiloti)
CREATE TABLE project_organization (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tax_id VARCHAR(50),
    address TEXT,
    phone_number VARCHAR(50),
    mfo VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Create contractor table (pudratchi)
CREATE TABLE contractor (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tax_id VARCHAR(50),
    address TEXT,
    phone_number VARCHAR(50),
    mfo VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Create construction_status table (qurilish_holati)
CREATE TABLE construction_status (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Create construction_items table (qurilish_predmetlari)
CREATE TABLE construction_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Create organizations table (tashkilot_nomi)
CREATE TABLE organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tax_id VARCHAR(50),
    region_id INTEGER NOT NULL REFERENCES regions(id) ON DELETE RESTRICT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Create users table (foydalanuvchilar)
-- Roles: super_admin, region_admin, user (technical supervisor)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    region_id INTEGER REFERENCES regions(id) ON DELETE RESTRICT,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    user_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT check_role CHECK (role IN ('super_admin', 'region_admin', 'user'))
);

-- Create object_card table (obyekt_kartasi)
CREATE TABLE object_card (
    id SERIAL PRIMARY KEY,
    card_number VARCHAR(100),
    object_name VARCHAR(255) NOT NULL,
    address TEXT,
    region_id INTEGER NOT NULL REFERENCES regions(id) ON DELETE RESTRICT,
    district_id INTEGER NOT NULL REFERENCES districts(id) ON DELETE RESTRICT,
    construction_basis TEXT,
    project_organization_id INTEGER NOT NULL REFERENCES project_organization(id) ON DELETE RESTRICT,
    object_passport TEXT,
    contractor_id INTEGER NOT NULL REFERENCES contractor(id) ON DELETE RESTRICT,
    technical_supervisor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    construction_start_date DATE,
    construction_end_date DATE,
    construction_status_id INTEGER NOT NULL REFERENCES construction_status(id) ON DELETE RESTRICT,
    construction_cost NUMERIC(15, 2),
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    building_type VARCHAR(50) DEFAULT 'new_building',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT check_building_type CHECK (building_type IN ('new_building', 'major_renovation'))
);

-- Create object_contract table (obyekt_shartnomasi)
CREATE TABLE object_contract (
    id SERIAL PRIMARY KEY,
    object_card_id INTEGER NOT NULL REFERENCES object_card(id) ON DELETE CASCADE,
    contract_number VARCHAR(100),
    contract_date DATE,
    contract_amount NUMERIC(15, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Create object_estimate table (obyekt_smetasi)
CREATE TABLE object_estimate (
    id SERIAL PRIMARY KEY,
    object_card_id INTEGER NOT NULL REFERENCES object_card(id) ON DELETE CASCADE,
    object_contract_id INTEGER NOT NULL REFERENCES object_contract(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    month_1 NUMERIC(15, 2) DEFAULT 0,
    month_2 NUMERIC(15, 2) DEFAULT 0,
    month_3 NUMERIC(15, 2) DEFAULT 0,
    month_4 NUMERIC(15, 2) DEFAULT 0,
    month_5 NUMERIC(15, 2) DEFAULT 0,
    month_6 NUMERIC(15, 2) DEFAULT 0,
    month_7 NUMERIC(15, 2) DEFAULT 0,
    month_8 NUMERIC(15, 2) DEFAULT 0,
    month_9 NUMERIC(15, 2) DEFAULT 0,
    month_10 NUMERIC(15, 2) DEFAULT 0,
    month_11 NUMERIC(15, 2) DEFAULT 0,
    month_12 NUMERIC(15, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Create sub_object_card table (sub_obyekt_kartasi)
CREATE TABLE sub_object_card (
    id SERIAL PRIMARY KEY,
    object_card_id INTEGER NOT NULL REFERENCES object_card(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    deadline DATE,
    cost NUMERIC(15, 2),
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Create sub_object_card_item table (sub_obyekt_kartasi_child)
CREATE TABLE sub_object_card_item (
    id SERIAL PRIMARY KEY,
    sub_object_card_id INTEGER NOT NULL REFERENCES sub_object_card(id) ON DELETE CASCADE,
    construction_item_id INTEGER NOT NULL REFERENCES construction_items(id) ON DELETE RESTRICT,
    deadline DATE,
    cost NUMERIC(15, 2),
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Create bank_expenses table (bank_chiqim)
CREATE TABLE bank_expenses (
    id SERIAL PRIMARY KEY,
    object_card_id INTEGER NOT NULL REFERENCES object_card(id) ON DELETE CASCADE,
    object_contract_id INTEGER NOT NULL REFERENCES object_contract(id) ON DELETE RESTRICT,
    registry_number VARCHAR(100),
    registry_date DATE,
    amount NUMERIC(15, 2),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Create invoices table (hisob_fakturalar)
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    object_card_id INTEGER NOT NULL REFERENCES object_card(id) ON DELETE CASCADE,
    object_contract_id INTEGER NOT NULL REFERENCES object_contract(id) ON DELETE RESTRICT,
    document_number VARCHAR(100),
    document_date DATE,
    amount NUMERIC(15, 2),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Create files table (fayllar)
CREATE TABLE files (
    id SERIAL PRIMARY KEY,
    object_card_id INTEGER NOT NULL REFERENCES object_card(id) ON DELETE CASCADE,
    path TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username) WHERE is_deleted = FALSE;
CREATE INDEX idx_users_email ON users(email) WHERE is_deleted = FALSE;
CREATE INDEX idx_users_organization ON users(organization_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_object_card_region ON object_card(region_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_object_card_district ON object_card(district_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_object_card_status ON object_card(construction_status_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_object_contract_card ON object_contract(object_card_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_object_estimate_card ON object_estimate(object_card_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_sub_object_card ON sub_object_card(object_card_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_bank_expenses_card ON bank_expenses(object_card_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_invoices_card ON invoices(object_card_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_files_card ON files(object_card_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_districts_region ON districts(region_id) WHERE is_deleted = FALSE;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables
CREATE TRIGGER update_regions_updated_at BEFORE UPDATE ON regions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_districts_updated_at BEFORE UPDATE ON districts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_organization_updated_at BEFORE UPDATE ON project_organization FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contractor_updated_at BEFORE UPDATE ON contractor FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_construction_status_updated_at BEFORE UPDATE ON construction_status FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_construction_items_updated_at BEFORE UPDATE ON construction_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_object_card_updated_at BEFORE UPDATE ON object_card FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_object_contract_updated_at BEFORE UPDATE ON object_contract FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_object_estimate_updated_at BEFORE UPDATE ON object_estimate FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sub_object_card_updated_at BEFORE UPDATE ON sub_object_card FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sub_object_card_item_updated_at BEFORE UPDATE ON sub_object_card_item FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bank_expenses_updated_at BEFORE UPDATE ON bank_expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default construction statuses
INSERT INTO construction_status (name) VALUES
    ('Планируется'),
    ('В процессе'),
    ('Завершено'),
    ('Приостановлено'),
    ('Отменено');

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database schema created successfully!';
END $$;
