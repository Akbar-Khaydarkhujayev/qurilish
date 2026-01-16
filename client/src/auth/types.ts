// User role types matching backend
export type UserRole = 'super_admin' | 'region_admin' | 'user';

export type UserType = {
  id: number;
  name: string;
  username: string;
  email?: string;
  organization_id: number;
  region_id?: number;
  role: UserRole;
  userType?: string;
  accessToken?: string;
} | null;

export type AuthState = {
  user: UserType;
  loading: boolean;
};

export type AuthContextValue = {
  user: UserType;
  loading: boolean;
  authenticated: boolean;
  unauthenticated: boolean;
  checkUserSession?: () => Promise<void>;
};
