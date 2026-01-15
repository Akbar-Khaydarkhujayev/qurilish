import type { IByIdResponse } from 'src/types/global';

import { useQuery } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import type { IExpense } from './get';

export const getExpenseById = (id?: string): Promise<IByIdResponse<IExpense>> =>
  axiosInstance.get(`/expenses/${id}`).then((res) => ({
    ...res.data,
    data: {
      ...res.data.data,
      amount: res.data.data.amount ? Number(res.data.data.amount) : null,
    },
  }));

export const useGetExpenseById = (id?: string) =>
  useQuery({
    queryKey: ['expense', id],
    queryFn: () => getExpenseById(id),
    enabled: !!id,
  });
