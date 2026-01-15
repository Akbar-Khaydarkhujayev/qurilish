import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import type { FormFields } from './schema';

const createExpense = (input: FormFields) =>
  axiosInstance.post('/expenses', input).then((res) => res.data);

export const useCreateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
};
