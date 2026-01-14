import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import type { FormFields } from './schema';

const editProjectOrganization = (input: FormFields) =>
  axiosInstance.put(`/project-organizations/${input.id}`, input).then((res) => res.data);

export const useEditProjectOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editProjectOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['project-organizations'],
      });
      queryClient.invalidateQueries({
        queryKey: ['project-organization'],
      });
    },
  });
};
