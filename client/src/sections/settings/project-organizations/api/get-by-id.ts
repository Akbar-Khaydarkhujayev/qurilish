import type { IByIdResponse } from 'src/types/global';

import { useQuery } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import type { IProjectOrganization } from './get';

export const getProjectOrganizationById = (id?: string): Promise<IByIdResponse<IProjectOrganization>> =>
  axiosInstance.get(`/project-organizations/${id}`).then((res) => res.data);

export const useGetProjectOrganizationById = (id?: string) =>
  useQuery({
    queryKey: ['project-organization', id],
    queryFn: () => getProjectOrganizationById(id),
    enabled: !!id,
  });
