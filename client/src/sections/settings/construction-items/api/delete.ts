import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';

const deleteConstructionItem = (id: number | string) =>
  axiosInstance.delete(`/construction-items/${id}`).then((res) => res.data);

export const useDeleteConstructionItem = () => {
  const { t } = useTranslate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteConstructionItem,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['construction-items'],
      });
      toast.success(t('deleteSuccess'));
    },
  });
};
