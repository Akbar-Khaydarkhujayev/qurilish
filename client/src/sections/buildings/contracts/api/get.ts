import { useQuery } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

export interface IContract {
  id: number;
  object_card_id: number;
  contract_number: string | null;
  contract_date: string | null;
  contract_amount: number | null;
  stage: string | null;
  object_name: string;
  card_number: string;
  created_at: string;
  updated_at: string;
}

export const getContractsByObjectCard = (objectCardId: string): Promise<IContract[]> =>
  axiosInstance
    .get(`/object-cards/${objectCardId}/contracts`)
    .then((res) =>
      res.data.data.map((item: IContract) => ({
        ...item,
        contract_amount: item.contract_amount ? Number(item.contract_amount) : null,
      }))
    );

export const useGetContractsByObjectCard = (objectCardId: string) =>
  useQuery({
    queryKey: ['contracts', objectCardId],
    queryFn: () => getContractsByObjectCard(objectCardId),
    enabled: !!objectCardId,
  });
