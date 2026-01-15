import type { IByIdResponse } from 'src/types/global';

import { useQuery } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import type { ISubObject } from './get';

export const getSubObjectById = (id?: string): Promise<IByIdResponse<ISubObject>> =>
  axiosInstance.get(`/sub-objects/${id}`).then((res) => ({
    ...res.data,
    data: {
      ...res.data.data,
      cost: res.data.data.cost ? Number(res.data.data.cost) : null,
    },
  }));

export const useGetSubObjectById = (id?: string) =>
  useQuery({
    queryKey: ['sub-object', id],
    queryFn: () => getSubObjectById(id),
    enabled: !!id,
  });
