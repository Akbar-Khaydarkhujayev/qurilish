import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';

const deleteBuilding = (id: number | string) =>
  axiosInstance.delete(`/object-cards/${id}`).then((res) => res.data);

export const useDeleteBuilding = () => {
  const { t } = useTranslate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBuilding,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['buildings'],
      });
      toast.success(t('deleteSuccess'));
    },
  });
};
