import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import type { FormFields } from './schema';

const createContract = (input: FormFields) =>
  axiosInstance.post('/contracts', input).then((res) => res.data);

export const useCreateContract = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createContract,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });
};
