import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import type { FormFields } from './schema';

const editContract = (input: FormFields) =>
  axiosInstance.put(`/contracts/${input.id}`, input).then((res) => res.data);

export const useEditContract = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editContract,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['contract'] });
    },
  });
};
