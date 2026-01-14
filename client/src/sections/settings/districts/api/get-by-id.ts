import type { IByIdResponse } from 'src/types/global';

import { useQuery } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import type { IDistrict } from './get';

export const getDistrictById = (id?: string): Promise<IByIdResponse<IDistrict>> =>
  axiosInstance.get(`/districts/${id}`).then((res) => res.data);

export const useGetDistrictById = (id?: string) =>
  useQuery({
    queryKey: ['district', id],
    queryFn: () => getDistrictById(id),
    enabled: !!id,
  });
