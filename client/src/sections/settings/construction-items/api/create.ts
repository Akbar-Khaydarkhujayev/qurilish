import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import type { FormFields } from './schema';

const createConstructionItem = (input: FormFields) =>
  axiosInstance.post('/construction-items', input).then((res) => res.data);

export const useCreateConstructionItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createConstructionItem,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['construction-items'],
      });
    },
  });
};
