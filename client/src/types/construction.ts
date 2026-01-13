// Construction Status Type
export type ConstructionStatus = {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
};

// Construction Item Type
export type ConstructionItem = {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
};

// Region Type
export type Region = {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
};

// District Type
export type District = {
  id: number;
  name: string;
  regionId: number;
  regionName?: string; // For display purposes
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
};

// Project Organization Type
export type ProjectOrganization = {
  id: number;
  name: string;
  taxId?: string;
  address?: string;
  phoneNumber?: string;
  mfo?: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
};

// Contractor Type
export type Contractor = {
  id: number;
  name: string;
  taxId?: string;
  address?: string;
  phoneNumber?: string;
  mfo?: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
};

// Organization Type
export type Organization = {
  id: number;
  name: string;
  taxId?: string;
  regionId: number;
  regionName?: string; // For display purposes
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
};

// User Role Type
export type UserRole = 'super_admin' | 'region_admin' | 'user';

// User Type
export type User = {
  id: number;
  name: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  organizationId: number;
  organizationName?: string; // For display purposes
  regionId?: number;
  regionName?: string; // For display purposes
  role: UserRole;
  userType?: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
};

// API Response Types
export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export type PaginatedResponse<T> = {
  success: boolean;
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
  };
  message?: string;
};
