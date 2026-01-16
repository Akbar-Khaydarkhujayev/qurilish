import { useQuery } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import type { ISubObjectItem } from './get';

export const getSubObjectItemById = (id: string): Promise<{ data: ISubObjectItem }> =>
  axiosInstance.get(`/sub-object-items/${id}`).then((res) => res.data);

export const useGetSubObjectItemById = (id: string | undefined) =>
  useQuery({
    queryKey: ['sub-object-item', id],
    queryFn: () => getSubObjectItemById(id!),
    enabled: !!id,
  });
