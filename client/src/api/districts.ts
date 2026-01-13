import type { District, ApiResponse, PaginatedResponse } from 'src/types/construction';

import axiosInstance from 'src/utils/axios-instance';

// ----------------------------------------------------------------------

const BASE_URL = '/api/districts';

export const districtsApi = {
  // Get all districts
  getAll: async (): Promise<District[]> => {
    const response = await axiosInstance.get<ApiResponse<District[]>>(BASE_URL);
    return response.data.data;
  },

  // Get paginated districts
  getPaginated: async (page: number = 1, limit: number = 10) => {
    const response = await axiosInstance.get<PaginatedResponse<District>>(
      `${BASE_URL}?page=${page}&limit=${limit}`
    );
    return response.data.data;
  },

  // Get single district by ID
  getById: async (id: number): Promise<District> => {
    const response = await axiosInstance.get<ApiResponse<District>>(`${BASE_URL}/${id}`);
    return response.data.data;
  },

  // Create district
  create: async (data: Omit<District, 'id'>): Promise<District> => {
    const response = await axiosInstance.post<ApiResponse<District>>(BASE_URL, data);
    return response.data.data;
  },

  // Update district
  update: async (id: number, data: Partial<District>): Promise<District> => {
    const response = await axiosInstance.put<ApiResponse<District>>(`${BASE_URL}/${id}`, data);
    return response.data.data;
  },

  // Delete district
  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  },
};
