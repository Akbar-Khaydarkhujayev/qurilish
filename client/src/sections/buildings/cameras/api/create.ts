import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import type { FormFields } from './schema';

const createCamera = ({ objectCardId, data }: { objectCardId: string; data: FormFields }) =>
  axiosInstance.post(`/object-cards/${objectCardId}/cameras`, data).then((res) => res.data);

export const useCreateCamera = (objectCardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FormFields) => createCamera({ objectCardId, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cameras', objectCardId] });
    },
  });
};
