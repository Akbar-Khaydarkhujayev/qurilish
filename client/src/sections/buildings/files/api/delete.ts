import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';

const deleteFile = (id: number | string) =>
  axiosInstance.delete(`/files/${id}`).then((res) => res.data);

export const useDeleteFile = () => {
  const { t } = useTranslate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success(t('deleteSuccess'));
    },
  });
};
