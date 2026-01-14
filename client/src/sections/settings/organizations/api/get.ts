import type { IReqParams } from 'src/types/global';
import type IPaginatedResponse from 'src/types/global';

import { useQuery } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

export interface IOrganization {
  id: number;
  name: string;
  tax_id: string;
  region_id: number;
  region_name: string;
  created_at: string;
  updated_at: string;
}

export const getOrganizations = (params: IReqParams): Promise<IPaginatedResponse<IOrganization>> =>
  axiosInstance.get('/organizations', { params }).then((res) => res.data);

export const useGetOrganizations = (params: IReqParams) =>
  useQuery({
    queryKey: ['organizations', params],
    queryFn: () => getOrganizations(params),
  });
