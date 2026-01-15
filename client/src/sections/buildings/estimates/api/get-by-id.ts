import type { IByIdResponse } from 'src/types/global';

import { useQuery } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import type { IEstimate } from './get';

export const getEstimateById = (id?: string): Promise<IByIdResponse<IEstimate>> =>
  axiosInstance.get(`/estimates/${id}`).then((res) => ({
    ...res.data,
    data: {
      ...res.data.data,
      month_1: res.data.data.month_1 ? Number(res.data.data.month_1) : 0,
      month_2: res.data.data.month_2 ? Number(res.data.data.month_2) : 0,
      month_3: res.data.data.month_3 ? Number(res.data.data.month_3) : 0,
      month_4: res.data.data.month_4 ? Number(res.data.data.month_4) : 0,
      month_5: res.data.data.month_5 ? Number(res.data.data.month_5) : 0,
      month_6: res.data.data.month_6 ? Number(res.data.data.month_6) : 0,
      month_7: res.data.data.month_7 ? Number(res.data.data.month_7) : 0,
      month_8: res.data.data.month_8 ? Number(res.data.data.month_8) : 0,
      month_9: res.data.data.month_9 ? Number(res.data.data.month_9) : 0,
      month_10: res.data.data.month_10 ? Number(res.data.data.month_10) : 0,
      month_11: res.data.data.month_11 ? Number(res.data.data.month_11) : 0,
      month_12: res.data.data.month_12 ? Number(res.data.data.month_12) : 0,
      year_total: res.data.data.year_total ? Number(res.data.data.year_total) : 0,
    },
  }));

export const useGetEstimateById = (id?: string) =>
  useQuery({
    queryKey: ['estimate', id],
    queryFn: () => getEstimateById(id),
    enabled: !!id,
  });
