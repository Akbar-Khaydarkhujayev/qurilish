import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';

const deleteRegion = (id: number | string) =>
  axiosInstance.delete(`/regions/${id}`).then((res) => res.data);

export const useDeleteRegion = () => {
  const { t } = useTranslate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRegion,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['regions'],
      });
      toast.success(t('deleteSuccess'));
    },
  });
};
