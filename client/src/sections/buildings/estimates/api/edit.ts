import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import type { FormFields } from './schema';

const editEstimate = (input: FormFields) =>
  axiosInstance.put(`/estimates/${input.id}`, input).then((res) => res.data);

export const useEditEstimate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editEstimate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimates'] });
      queryClient.invalidateQueries({ queryKey: ['estimate'] });
    },
  });
};
