import { useQuery } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

export interface IEstimate {
  id: number;
  object_card_id: number;
  object_contract_id: number;
  year: number;
  month_1: number;
  month_2: number;
  month_3: number;
  month_4: number;
  month_5: number;
  month_6: number;
  month_7: number;
  month_8: number;
  month_9: number;
  month_10: number;
  month_11: number;
  month_12: number;
  year_total: number;
  contract_number: string | null;
  object_name: string;
  card_number: string;
  created_at: string;
  updated_at: string;
}

export const getEstimatesByObjectCard = (objectCardId: string): Promise<IEstimate[]> =>
  axiosInstance.get(`/object-cards/${objectCardId}/estimates`).then((res) =>
    res.data.data.map((item: IEstimate) => ({
      ...item,
      month_1: item.month_1 ? Number(item.month_1) : 0,
      month_2: item.month_2 ? Number(item.month_2) : 0,
      month_3: item.month_3 ? Number(item.month_3) : 0,
      month_4: item.month_4 ? Number(item.month_4) : 0,
      month_5: item.month_5 ? Number(item.month_5) : 0,
      month_6: item.month_6 ? Number(item.month_6) : 0,
      month_7: item.month_7 ? Number(item.month_7) : 0,
      month_8: item.month_8 ? Number(item.month_8) : 0,
      month_9: item.month_9 ? Number(item.month_9) : 0,
      month_10: item.month_10 ? Number(item.month_10) : 0,
      month_11: item.month_11 ? Number(item.month_11) : 0,
      month_12: item.month_12 ? Number(item.month_12) : 0,
      year_total: item.year_total ? Number(item.year_total) : 0,
    }))
  );

export const useGetEstimatesByObjectCard = (objectCardId: string) =>
  useQuery({
    queryKey: ['estimates', objectCardId],
    queryFn: () => getEstimatesByObjectCard(objectCardId),
    enabled: !!objectCardId,
  });
