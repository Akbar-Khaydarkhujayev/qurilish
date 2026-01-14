import type { IReqParams } from 'src/types/global';
import type IPaginatedResponse from 'src/types/global';

import { useQuery } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

export interface IContractor {
  id: number;
  name: string;
  tax_id?: string;
  address?: string;
  phone_number?: string;
  mfo?: string;
  created_at: string;
  updated_at: string;
}

export const getContractors = (
  params: IReqParams
): Promise<IPaginatedResponse<IContractor>> =>
  axiosInstance.get('/contractors', { params }).then((res) => res.data);

export const useGetContractors = (params: IReqParams) =>
  useQuery({
    queryKey: ['contractors', params],
    queryFn: () => getContractors(params),
  });
