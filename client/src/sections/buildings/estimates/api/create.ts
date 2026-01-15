import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import type { FormFields } from './schema';

const createEstimate = (input: FormFields) =>
  axiosInstance.post('/estimates', input).then((res) => res.data);

export const useCreateEstimate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEstimate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimates'] });
    },
  });
};
