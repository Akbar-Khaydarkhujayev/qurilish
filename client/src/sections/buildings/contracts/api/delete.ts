import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';

const deleteContract = (id: number | string) =>
  axiosInstance.delete(`/contracts/${id}`).then((res) => res.data);

export const useDeleteContract = () => {
  const { t } = useTranslate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteContract,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast.success(t('deleteSuccess'));
    },
  });
};
