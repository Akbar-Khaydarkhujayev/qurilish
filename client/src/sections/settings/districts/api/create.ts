import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import type { FormFields } from './schema';

const createDistrict = (input: FormFields) =>
  axiosInstance.post('/districts', input).then((res) => res.data);

export const useCreateDistrict = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDistrict,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['districts'],
      });
    },
  });
};
