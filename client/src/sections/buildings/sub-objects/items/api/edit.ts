import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import type { FormFields } from './schema';

export const editSubObjectItem = (data: FormFields) =>
  axiosInstance.put(`/sub-object-items/${data.id}`, data);

export const useEditSubObjectItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editSubObjectItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sub-object-items'] });
      queryClient.invalidateQueries({ queryKey: ['sub-object-item'] });
      queryClient.invalidateQueries({ queryKey: ['sub-objects'] });
    },
  });
};
