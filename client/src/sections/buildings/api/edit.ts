import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import type { FormFields } from './schema';

const editBuilding = (input: FormFields) =>
  axiosInstance.put(`/object-cards/${input.id}`, input).then((res) => res.data);

export const useEditBuilding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editBuilding,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['buildings'],
      });
      queryClient.invalidateQueries({
        queryKey: ['building'],
      });
    },
  });
};
