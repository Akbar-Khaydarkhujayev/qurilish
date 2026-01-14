import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import type { FormFields } from './schema';

const editConstructionItem = (input: FormFields) =>
  axiosInstance.put(`/construction-items/${input.id}`, input).then((res) => res.data);

export const useEditConstructionItem = (id?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editConstructionItem,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['construction-items'],
      });
      if (id)
        queryClient.invalidateQueries({
          queryKey: ['construction-item', id],
        });
    },
  });
};
