import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import type { FormFields } from './schema';

const editOrganization = (input: FormFields) =>
  axiosInstance.put(`/organizations/${input.id}`, input).then((res) => res.data);

export const useEditOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['organizations'],
      });
      queryClient.invalidateQueries({
        queryKey: ['organization'],
      });
    },
  });
};
