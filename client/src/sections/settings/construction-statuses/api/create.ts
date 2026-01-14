import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import type { FormFields } from './schema';

const createConstructionStatus = (input: FormFields) =>
  axiosInstance.post('/construction-statuses', input).then((res) => res.data);

export const useCreateConstructionStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createConstructionStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['construction-statuses'],
      });
    },
  });
};
