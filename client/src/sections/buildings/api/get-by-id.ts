import type { IByIdResponse } from 'src/types/global';

import { useQuery } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import type { IBuilding } from './get';

export const getBuildingById = (id?: string): Promise<IByIdResponse<IBuilding>> =>
  axiosInstance.get(`/object-cards/${id}`).then((res) => res.data);

export const useGetBuildingById = (id?: string) =>
  useQuery({
    queryKey: ['building', id],
    queryFn: () => getBuildingById(id),
    enabled: !!id,
  });
