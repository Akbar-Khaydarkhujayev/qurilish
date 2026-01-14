import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';

const deleteContractor = (id: number | string) =>
  axiosInstance.delete(`/contractors/${id}`).then((res) => res.data);

export const useDeleteContractor = () => {
  const { t } = useTranslate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteContractor,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['contractors'],
      });
      toast.success(t('deleteSuccess'));
    },
  });
};
