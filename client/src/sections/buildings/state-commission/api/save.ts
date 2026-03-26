import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

export interface SaveStateCommissionInput {
  objectCardId: string;
  document_number?: string;
  document_date?: string;
  comment?: string;
  pdf_file?: File | null;
}

const saveStateCommission = (input: SaveStateCommissionInput) => {
  const formData = new FormData();
  if (input.document_number) formData.append('document_number', input.document_number);
  if (input.document_date) formData.append('document_date', input.document_date);
  if (input.comment) formData.append('comment', input.comment);
  if (input.pdf_file) formData.append('pdf_file', input.pdf_file);

  return axiosInstance
    .post(`/object-cards/${input.objectCardId}/state-commission`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res.data);
};

export const useSaveStateCommission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveStateCommission,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['state-commission', variables.objectCardId] });
      queryClient.invalidateQueries({ queryKey: ['building', variables.objectCardId] });
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
    },
  });
};
