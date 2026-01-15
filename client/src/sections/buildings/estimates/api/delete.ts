import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';

const deleteEstimate = (id: number | string) =>
  axiosInstance.delete(`/estimates/${id}`).then((res) => res.data);

export const useDeleteEstimate = () => {
  const { t } = useTranslate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEstimate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimates'] });
      toast.success(t('deleteSuccess'));
    },
  });
};
