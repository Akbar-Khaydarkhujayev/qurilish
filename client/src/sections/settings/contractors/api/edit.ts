import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import type { FormFields } from './schema';

const editContractor = (input: FormFields) =>
  axiosInstance.put(`/contractors/${input.id}`, input).then((res) => res.data);

export const useEditContractor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editContractor,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['contractors'],
      });
      queryClient.invalidateQueries({
        queryKey: ['contractor'],
      });
    },
  });
};
