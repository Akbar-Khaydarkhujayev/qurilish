import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

export const deleteSubObjectItem = (id: number) => axiosInstance.delete(`/sub-object-items/${id}`);

export const useDeleteSubObjectItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSubObjectItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sub-object-items'] });
      queryClient.invalidateQueries({ queryKey: ['sub-objects'] });
    },
  });
};
