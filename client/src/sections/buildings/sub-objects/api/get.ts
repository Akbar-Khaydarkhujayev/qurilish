import { useQuery } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

export interface ISubObject {
  id: number;
  object_card_id: number;
  name: string;
  deadline: string | null;
  cost: number | null;
  completion_percentage: number;
  items_count: number;
  object_name: string;
  card_number: string;
  created_at: string;
  updated_at: string;
}

export const getSubObjectsByObjectCard = (objectCardId: string): Promise<ISubObject[]> =>
  axiosInstance
    .get(`/object-cards/${objectCardId}/sub-objects`)
    .then((res) =>
      res.data.data.map((item: ISubObject) => ({
        ...item,
        cost: item.cost ? Number(item.cost) : null,
      }))
    );

export const useGetSubObjectsByObjectCard = (objectCardId: string) =>
  useQuery({
    queryKey: ['sub-objects', objectCardId],
    queryFn: () => getSubObjectsByObjectCard(objectCardId),
    enabled: !!objectCardId,
  });
