import type { IByIdResponse } from 'src/types/global';

import { useQuery } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import type { IInvoice } from './get';

export const getInvoiceById = (id?: string): Promise<IByIdResponse<IInvoice>> =>
  axiosInstance.get(`/invoices/${id}`).then((res) => ({
    ...res.data,
    data: {
      ...res.data.data,
      amount: res.data.data.amount ? Number(res.data.data.amount) : null,
    },
  }));

export const useGetInvoiceById = (id?: string) =>
  useQuery({
    queryKey: ['invoice', id],
    queryFn: () => getInvoiceById(id),
    enabled: !!id,
  });
