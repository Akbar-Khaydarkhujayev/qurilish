import type { IReqParams } from 'src/types/global';
import type IPaginatedResponse from 'src/types/global';

import { useQuery } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

export interface IRegion {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export const getRegions = (
  params: IReqParams
): Promise<IPaginatedResponse<IRegion>> =>
  axiosInstance.get('/regions', { params }).then((res) => res.data);

export const useGetRegions = (params: IReqParams) =>
  useQuery({
    queryKey: ['regions', params],
    queryFn: () => getRegions(params),
  });
