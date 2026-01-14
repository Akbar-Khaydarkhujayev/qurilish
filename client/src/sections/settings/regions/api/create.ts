import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import type { FormFields } from './schema';

const createRegion = (input: FormFields) =>
  axiosInstance.post('/regions', input).then((res) => res.data);

export const useCreateRegion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRegion,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['regions'],
      });
    },
  });
};
