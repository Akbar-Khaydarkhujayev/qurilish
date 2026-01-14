import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';

const deleteConstructionStatus = (id: number | string) =>
  axiosInstance.delete(`/construction-statuses/${id}`).then((res) => res.data);

export const useDeleteConstructionStatus = () => {
  const { t } = useTranslate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteConstructionStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['construction-statuses'],
      });
      toast.success(t('deleteSuccess'));
    },
  });
};
