import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import type { FormFields } from './schema';

const createSubObject = (input: FormFields) =>
  axiosInstance.post('/sub-objects', input).then((res) => res.data);

export const useCreateSubObject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSubObject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sub-objects'] });
    },
  });
};
