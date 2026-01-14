import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import type { FormFields } from './schema';

const editConstructionStatus = (input: FormFields) =>
  axiosInstance.put(`/construction-statuses/${input.id}`, input).then((res) => res.data);

export const useEditConstructionStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editConstructionStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['construction-statuses'],
      });
      queryClient.invalidateQueries({
        queryKey: ['construction-status'],
      });
    },
  });
};
