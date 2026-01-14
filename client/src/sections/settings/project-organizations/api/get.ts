import type { IReqParams } from 'src/types/global';
import type IPaginatedResponse from 'src/types/global';

import { useQuery } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

export interface IProjectOrganization {
  id: number;
  name: string;
  tax_id?: string;
  address?: string;
  phone_number?: string;
  mfo?: string;
  created_at: string;
  updated_at: string;
}

export const getProjectOrganizations = (
  params: IReqParams
): Promise<IPaginatedResponse<IProjectOrganization>> =>
  axiosInstance.get('/project-organizations', { params }).then((res) => res.data);

export const useGetProjectOrganizations = (params: IReqParams) =>
  useQuery({
    queryKey: ['project-organizations', params],
    queryFn: () => getProjectOrganizations(params),
  });
