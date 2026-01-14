import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import type { FormFields } from './schema';

const editDistrict = (input: FormFields) =>
  axiosInstance.put(`/districts/${input.id}`, input).then((res) => res.data);

export const useEditDistrict = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editDistrict,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['districts'],
      });
      queryClient.invalidateQueries({
        queryKey: ['district'],
      });
    },
  });
};
