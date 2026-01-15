import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import type { FormFields } from './schema';

const createBuilding = (input: FormFields) =>
  axiosInstance.post('/object-cards', input).then((res) => res.data);

export const useCreateBuilding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBuilding,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['buildings'],
      });
    },
  });
};
