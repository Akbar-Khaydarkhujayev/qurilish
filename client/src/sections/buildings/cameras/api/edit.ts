import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import type { FormFields } from './schema';

const editCamera = (data: FormFields) =>
  axiosInstance.put(`/cameras/${data.id}`, data).then((res) => res.data);

export const useEditCamera = (objectCardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editCamera,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cameras', objectCardId] });
    },
  });
};
