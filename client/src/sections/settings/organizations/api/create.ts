import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import type { FormFields } from './schema';

const createOrganization = (input: FormFields) =>
  axiosInstance.post('/organizations', input).then((res) => res.data);

export const useCreateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['organizations'],
      });
    },
  });
};
