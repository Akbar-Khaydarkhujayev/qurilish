import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import type { FormFields } from './schema';

const editSubObject = (input: FormFields) =>
  axiosInstance.put(`/sub-objects/${input.id}`, input).then((res) => res.data);

export const useEditSubObject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editSubObject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sub-objects'] });
      queryClient.invalidateQueries({ queryKey: ['sub-object'] });
    },
  });
};
