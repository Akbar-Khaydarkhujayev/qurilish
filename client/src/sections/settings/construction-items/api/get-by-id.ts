import type { IByIdResponse } from 'src/types/global';

import { useQuery } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import type { IConstructionItem } from './get';

export const getConstructionItemById = (id?: string): Promise<IByIdResponse<IConstructionItem>> =>
  axiosInstance.get(`/construction-items/${id}`).then((res) => res.data);

export const useGetConstructionItemById = (id?: string) =>
  useQuery({
    queryKey: ['construction-item', id],
    queryFn: () => getConstructionItemById(id),
    enabled: !!id,
  });
