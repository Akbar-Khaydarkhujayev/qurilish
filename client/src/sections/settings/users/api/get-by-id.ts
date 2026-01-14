import type { IByIdResponse } from 'src/types/global';

import { useQuery } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

import type { IUser } from './get';

export const getUserById = (id?: string): Promise<IByIdResponse<IUser>> =>
  axiosInstance.get(`/users/${id}`).then((res) => res.data);

export const useGetUserById = (id?: string) =>
  useQuery({
    queryKey: ['user', id],
    queryFn: () => getUserById(id),
    enabled: !!id,
  });
