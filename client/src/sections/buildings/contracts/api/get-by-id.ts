import type { IByIdResponse } from 'src/types/global';

import { useQuery } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import type { IContract } from './get';

export const getContractById = (id?: string): Promise<IByIdResponse<IContract>> =>
  axiosInstance.get(`/contracts/${id}`).then((res) => ({
    ...res.data,
    data: {
      ...res.data.data,
      contract_amount: res.data.data.contract_amount
        ? Number(res.data.data.contract_amount)
        : null,
    },
  }));

export const useGetContractById = (id?: string) =>
  useQuery({
    queryKey: ['contract', id],
    queryFn: () => getContractById(id),
    enabled: !!id,
  });
