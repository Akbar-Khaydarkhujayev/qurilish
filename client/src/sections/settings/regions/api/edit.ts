import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import type { FormFields } from './schema';

const editRegion = (input: FormFields) =>
  axiosInstance.put(`/regions/${input.id}`, input).then((res) => res.data);

export const useEditRegion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editRegion,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['regions'],
      });
      queryClient.invalidateQueries({
        queryKey: ['region'],
      });
    },
  });
};
