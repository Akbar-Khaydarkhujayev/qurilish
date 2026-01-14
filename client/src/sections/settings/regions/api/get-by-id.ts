import type { IByIdResponse } from 'src/types/global';

import { useQuery } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import type { IRegion } from './get';

export const getRegionById = (id?: string): Promise<IByIdResponse<IRegion>> =>
  axiosInstance.get(`/regions/${id}`).then((res) => res.data);

export const useGetRegionById = (id?: string) =>
  useQuery({
    queryKey: ['region', id],
    queryFn: () => getRegionById(id),
    enabled: !!id,
  });
