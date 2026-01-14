import type { IReqParams } from 'src/types/global';
import type IPaginatedResponse from 'src/types/global';

import { useQuery } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

export interface IConstructionStatus {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export const getConstructionStatuses = (
  params: IReqParams
): Promise<IPaginatedResponse<IConstructionStatus>> =>
  axiosInstance.get('/construction-statuses', { params }).then((res) => res.data);

export const useGetConstructionStatuses = (params: IReqParams) =>
  useQuery({
    queryKey: ['construction-statuses', params],
    queryFn: () => getConstructionStatuses(params),
  });
