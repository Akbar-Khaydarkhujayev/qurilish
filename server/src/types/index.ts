import { Request } from 'express';

// Auth types
export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    email?: string;
    role?: string;
    organization_id: number;
  };
}

export interface TokenPayload {
  id: number;
  username: string;
  email?: string;
  role?: string;
  organization_id: number;
}

// User types
export type UserRole = 'super_admin' | 'region_admin' | 'user';

export interface User {
  id: number;
  name: string;
  username: string;
  password: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  organization_id: number;
  region_id?: number;
  role: UserRole;
  user_type?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
}

// Region & District
export interface Region {
  id: number;
  name: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
}

export interface District {
  id: number;
  name: string;
  region_id: number;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
}

// Organization
export interface Organization {
  id: number;
  name: string;
  tax_id?: string;
  region_id: number;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
}

// Project Organization
export interface ProjectOrganization {
  id: number;
  name: string;
  tax_id?: string;
  address?: string;
  phone_number?: string;
  mfo?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
}

// Contractor
export interface Contractor {
  id: number;
  name: string;
  tax_id?: string;
  address?: string;
  phone_number?: string;
  mfo?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
}

// Construction Status
export interface ConstructionStatus {
  id: number;
  name: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
}

// Construction Items
export interface ConstructionItem {
  id: number;
  name: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
}

// Object Card
export interface ObjectCard {
  id: number;
  card_number?: string;
  object_name: string;
  address?: string;
  region_id: number;
  district_id: number;
  construction_basis?: string;
  project_organization_id: number;
  object_passport?: string;
  contractor_id: number;
  technical_supervisor_id?: number;
  construction_start_date?: Date;
  construction_end_date?: Date;
  construction_status_id: number;
  construction_cost?: number;
  organization_id: number;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
}

// Object Contract
export interface ObjectContract {
  id: number;
  object_card_id: number;
  contract_number?: string;
  contract_date?: Date;
  contract_amount?: number;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
}

// Object Estimate
export interface ObjectEstimate {
  id: number;
  object_card_id: number;
  object_contract_id: number;
  year: number;
  month_1?: number;
  month_2?: number;
  month_3?: number;
  month_4?: number;
  month_5?: number;
  month_6?: number;
  month_7?: number;
  month_8?: number;
  month_9?: number;
  month_10?: number;
  month_11?: number;
  month_12?: number;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
}

// Sub Object Card
export interface SubObjectCard {
  id: number;
  object_card_id: number;
  name: string;
  deadline?: Date;
  cost?: number;
  completion_percentage?: number;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
}

// Sub Object Card Item
export interface SubObjectCardItem {
  id: number;
  sub_object_card_id: number;
  construction_item_id: number;
  deadline?: Date;
  cost?: number;
  completion_percentage?: number;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
}

// Bank Expenses
export interface BankExpense {
  id: number;
  object_card_id: number;
  object_contract_id: number;
  registry_number?: string;
  registry_date?: Date;
  amount?: number;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
}

// Invoices
export interface Invoice {
  id: number;
  object_card_id: number;
  object_contract_id: number;
  document_number?: string;
  document_date?: Date;
  amount?: number;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
}

// Files
export interface File {
  id: number;
  object_card_id: number;
  path: string;
  file_name: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
}

// Query filters
export interface QueryFilters {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
  search?: string;
}
