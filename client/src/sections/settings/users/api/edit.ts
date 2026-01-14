import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import type { FormFields } from './schema';

const editUser = (input: FormFields) =>
  axiosInstance.put(`/users/${input.id}`, input).then((res) => res.data);

export const useEditUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editUser,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['users'],
      });
      queryClient.invalidateQueries({
        queryKey: ['user'],
      });
    },
  });
};
