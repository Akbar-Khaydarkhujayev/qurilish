import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';

const deleteCamera = (id: number) =>
  axiosInstance.delete(`/cameras/${id}`).then((res) => res.data);

export const useDeleteCamera = (objectCardId: string) => {
  const { t } = useTranslate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCamera,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cameras', objectCardId] });
      toast.success(t('deleteSuccess'));
    },
  });
};
