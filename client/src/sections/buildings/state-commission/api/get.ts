import { useQuery } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

export interface IStateCommission {
  id: number;
  object_card_id: number;
  document_number: string | null;
  document_date: string | null;
  comment: string | null;
  pdf_file_path: string | null;
  pdf_file_name: string | null;
  created_at: string;
  updated_at: string;
}

export const getStateCommission = (objectCardId: string): Promise<{ data: IStateCommission | null }> =>
  axiosInstance.get(`/object-cards/${objectCardId}/state-commission`).then((res) => res.data);

export const useGetStateCommission = (objectCardId: string) =>
  useQuery({
    queryKey: ['state-commission', objectCardId],
    queryFn: () => getStateCommission(objectCardId),
    enabled: !!objectCardId,
  });
