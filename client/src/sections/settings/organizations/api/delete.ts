import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';

const deleteOrganization = (id: number | string) =>
  axiosInstance.delete(`/organizations/${id}`).then((res) => res.data);

export const useDeleteOrganization = () => {
  const { t } = useTranslate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['organizations'],
      });
      toast.success(t('deleteSuccess'));
    },
  });
};
