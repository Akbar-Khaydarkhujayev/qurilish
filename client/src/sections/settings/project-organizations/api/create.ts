import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import type { FormFields } from './schema';

const createProjectOrganization = (input: FormFields) =>
  axiosInstance.post('/project-organizations', input).then((res) => res.data);

export const useCreateProjectOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProjectOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['project-organizations'],
      });
    },
  });
};
