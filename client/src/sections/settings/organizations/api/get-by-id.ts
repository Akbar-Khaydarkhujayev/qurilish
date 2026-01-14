import type { IByIdResponse } from 'src/types/global';

import { useQuery } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import type { IOrganization } from './get';

export const getOrganizationById = (id?: string): Promise<IByIdResponse<IOrganization>> =>
  axiosInstance.get(`/organizations/${id}`).then((res) => res.data);

export const useGetOrganizationById = (id?: string) =>
  useQuery({
    queryKey: ['organization', id],
    queryFn: () => getOrganizationById(id),
    enabled: !!id,
  });
