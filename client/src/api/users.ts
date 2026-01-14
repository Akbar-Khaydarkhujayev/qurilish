import type { User, ApiResponse, PaginatedResponse } from 'src/types/construction';

import axiosInstance from 'src/utils/axios';

// ----------------------------------------------------------------------

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const response = await axiosInstance.get<ApiResponse<User[]>>('/users');
    return response.data.data;
  },

  getPaginated: async (
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<User>['data']> => {
    const response = await axiosInstance.get<PaginatedResponse<User>>('/users', {
      params: { page, limit },
    });
    return response.data.data;
  },

  getById: async (id: number): Promise<User> => {
    const response = await axiosInstance.get<ApiResponse<User>>(`/users/${id}`);
    return response.data.data;
  },

  create: async (data: Omit<User, 'id'> & { password: string }): Promise<User> => {
    const response = await axiosInstance.post<ApiResponse<User>>('/users', data);
    return response.data.data;
  },

  update: async (id: number, data: Partial<User>): Promise<User> => {
    const response = await axiosInstance.put<ApiResponse<User>>(`/users/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/users/${id}`);
  },
};
