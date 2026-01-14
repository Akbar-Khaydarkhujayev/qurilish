import type { IByIdResponse } from 'src/types/global';

import { useQuery } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import type { IConstructionStatus } from './get';

export const getConstructionStatusById = (id?: string): Promise<IByIdResponse<IConstructionStatus>> =>
  axiosInstance.get(`/construction-statuses/${id}`).then((res) => res.data);

export const useGetConstructionStatusById = (id?: string) =>
  useQuery({
    queryKey: ['construction-status', id],
    queryFn: () => getConstructionStatusById(id),
    enabled: !!id,
  });
