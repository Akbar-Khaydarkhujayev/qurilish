import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import type { FormFields } from './schema';

const editExpense = (input: FormFields) =>
  axiosInstance.put(`/expenses/${input.id}`, input).then((res) => res.data);

export const useEditExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense'] });
    },
  });
};
