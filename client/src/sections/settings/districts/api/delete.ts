import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';

const deleteDistrict = (id: number | string) =>
  axiosInstance.delete(`/districts/${id}`).then((res) => res.data);

export const useDeleteDistrict = () => {
  const { t } = useTranslate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDistrict,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['districts'],
      });
      toast.success(t('deleteSuccess'));
    },
  });
};
