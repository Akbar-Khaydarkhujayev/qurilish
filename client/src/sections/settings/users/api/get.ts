import type { IReqParams } from 'src/types/global';
import type IPaginatedResponse from 'src/types/global';

import { useQuery } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import type { IOrganization } from '../../organizations/api/get';

export type UserRole = 'super_admin' | 'region_admin' | 'user';

export interface IUser {
  id: number;
  name: string;
  username: string;
  phone_number: string | null;
  organization_id: number;
  organization?: IOrganization;
  role: UserRole;
  user_type: string;
  created_at: string;
  updated_at: string;
}

export const getUsers = (
  params: IReqParams
): Promise<IPaginatedResponse<IUser>> =>
  axiosInstance.get('/users', { params }).then((res) => res.data);

export const useGetUsers = (params: IReqParams) =>
  useQuery({
    queryKey: ['users', params],
    queryFn: () => getUsers(params),
  });
