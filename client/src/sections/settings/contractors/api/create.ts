import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import type { FormFields } from './schema';

const createContractor = (input: FormFields) =>
  axiosInstance.post('/contractors', input).then((res) => res.data);

export const useCreateContractor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createContractor,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['contractors'],
      });
    },
  });
};
