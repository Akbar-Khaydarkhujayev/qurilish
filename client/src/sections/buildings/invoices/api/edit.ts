import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import type { FormFields } from './schema';

const editInvoice = (input: FormFields) =>
  axiosInstance.put(`/invoices/${input.id}`, input).then((res) => res.data);

export const useEditInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice'] });
    },
  });
};
