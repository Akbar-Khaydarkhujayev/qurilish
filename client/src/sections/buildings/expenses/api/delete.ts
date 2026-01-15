import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';

const deleteExpense = (id: number | string) =>
  axiosInstance.delete(`/expenses/${id}`).then((res) => res.data);

export const useDeleteExpense = () => {
  const { t } = useTranslate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success(t('deleteSuccess'));
    },
  });
};
