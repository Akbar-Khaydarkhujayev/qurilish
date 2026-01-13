import type { Region, ApiResponse, PaginatedResponse } from 'src/types/construction';

import axiosInstance from 'src/utils/axios-instance';

// ----------------------------------------------------------------------

const BASE_URL = '/api/regions';

export const regionsApi = {
  // Get all regions
  getAll: async (): Promise<Region[]> => {
    const response = await axiosInstance.get<ApiResponse<Region[]>>(BASE_URL);
    return response.data.data;
  },

  // Get paginated regions
  getPaginated: async (page: number = 1, limit: number = 10) => {
    const response = await axiosInstance.get<PaginatedResponse<Region>>(
      `${BASE_URL}?page=${page}&limit=${limit}`
    );
    return response.data.data;
  },

  // Get single region by ID
  getById: async (id: number): Promise<Region> => {
    const response = await axiosInstance.get<ApiResponse<Region>>(`${BASE_URL}/${id}`);
    return response.data.data;
  },

  // Create region
  create: async (data: Omit<Region, 'id'>): Promise<Region> => {
    const response = await axiosInstance.post<ApiResponse<Region>>(BASE_URL, data);
    return response.data.data;
  },

  // Update region
  update: async (id: number, data: Partial<Region>): Promise<Region> => {
    const response = await axiosInstance.put<ApiResponse<Region>>(`${BASE_URL}/${id}`, data);
    return response.data.data;
  },

  // Delete region
  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  },
};
