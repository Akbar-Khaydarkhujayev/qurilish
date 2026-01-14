import type { IReqParams } from 'src/types/global';
import type IPaginatedResponse from 'src/types/global';

import { useQuery } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

export interface IConstructionItem {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export const getConstructionItems = (
  params: IReqParams
): Promise<IPaginatedResponse<IConstructionItem>> =>
  axiosInstance.get('/construction-items', { params }).then((res) => res.data);

export const useGetConstructionItems = (params: IReqParams) =>
  useQuery({
    queryKey: ['construction-items', params],
    queryFn: () => getConstructionItems(params),
  });
