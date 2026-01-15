import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';

const deleteSubObject = (id: number | string) =>
  axiosInstance.delete(`/sub-objects/${id}`).then((res) => res.data);

export const useDeleteSubObject = () => {
  const { t } = useTranslate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSubObject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sub-objects'] });
      toast.success(t('deleteSuccess'));
    },
  });
};
