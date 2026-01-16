import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import type { FormFields } from './schema';

export const createSubObjectItem = (data: FormFields) =>
  axiosInstance.post('/sub-object-items', data);

export const useCreateSubObjectItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSubObjectItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sub-object-items'] });
      queryClient.invalidateQueries({ queryKey: ['sub-objects'] });
    },
  });
};
