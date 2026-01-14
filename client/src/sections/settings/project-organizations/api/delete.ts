import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';

const deleteProjectOrganization = (id: number | string) =>
  axiosInstance.delete(`/project-organizations/${id}`).then((res) => res.data);

export const useDeleteProjectOrganization = () => {
  const { t } = useTranslate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProjectOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['project-organizations'],
      });
      toast.success(t('deleteSuccess'));
    },
  });
};
