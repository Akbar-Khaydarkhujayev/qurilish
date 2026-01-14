import type { IByIdResponse } from 'src/types/global';

import { useQuery } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import type { IContractor } from './get';

export const getContractorById = (id?: string): Promise<IByIdResponse<IContractor>> =>
  axiosInstance.get(`/contractors/${id}`).then((res) => res.data);

export const useGetContractorById = (id?: string) =>
  useQuery({
    queryKey: ['contractor', id],
    queryFn: () => getContractorById(id),
    enabled: !!id,
  });
