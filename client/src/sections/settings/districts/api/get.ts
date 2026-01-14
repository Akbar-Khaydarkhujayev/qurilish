import type { IReqParams } from 'src/types/global';
import type IPaginatedResponse from 'src/types/global';

import { useQuery } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

export interface IDistrict {
  id: number;
  name: string;
  region_id: number;
  region_name: string;
  created_at: string;
  updated_at: string;
}

export const getDistricts = (params: IReqParams): Promise<IPaginatedResponse<IDistrict>> =>
  axiosInstance.get('/districts', { params }).then((res) => res.data);

export const useGetDistricts = (params: IReqParams) =>
  useQuery({
    queryKey: ['districts', params],
    queryFn: () => getDistricts(params),
  });
