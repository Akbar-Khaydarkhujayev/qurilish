import { useQuery } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

export interface ISubObjectItem {
  id: number;
  sub_object_card_id: number;
  construction_item_id: number;
  item_name: string;
  deadline: string | null;
  cost: number | null;
  completion_percentage: number;
  created_at: string;
  updated_at: string;
}

export const getSubObjectItems = (subObjectCardId: number): Promise<ISubObjectItem[]> =>
  axiosInstance
    .get(`/sub-objects/${subObjectCardId}/items`)
    .then((res) =>
      res.data.data.map((item: ISubObjectItem) => ({
        ...item,
        cost: item.cost ? Number(item.cost) : null,
      }))
    );

export const useGetSubObjectItems = (subObjectCardId: number | undefined) =>
  useQuery({
    queryKey: ['sub-object-items', subObjectCardId],
    queryFn: () => getSubObjectItems(subObjectCardId!),
    enabled: !!subObjectCardId,
  });
