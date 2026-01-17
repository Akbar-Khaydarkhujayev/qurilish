import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

interface UploadFileInput {
  object_card_id: number;
  file: File;
  description?: string;
}

const uploadFile = (input: UploadFileInput) => {
  const formData = new FormData();
  formData.append('object_card_id', String(input.object_card_id));
  formData.append('file', input.file);
  if (input.description) {
    formData.append('description', input.description);
  }

  return axiosInstance
    .post('/files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then((res) => res.data);
};

export const useUploadFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });
};
