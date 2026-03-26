import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

const deletePdf = (objectCardId: string) =>
  axiosInstance
    .delete(`/object-cards/${objectCardId}/state-commission/pdf`)
    .then((res) => res.data);

export const useDeleteStateCommissionPdf = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePdf,
    onSuccess: (_data, objectCardId) => {
      queryClient.invalidateQueries({ queryKey: ['state-commission', objectCardId] });
      queryClient.invalidateQueries({ queryKey: ['building', objectCardId] });
    },
  });
};
