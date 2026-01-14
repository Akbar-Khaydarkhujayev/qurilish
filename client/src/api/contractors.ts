import type { Contractor, ApiResponse, PaginatedResponse } from 'src/types/construction';

import axiosInstance from 'src/utils/axios';

// ----------------------------------------------------------------------

const BASE_URL = '/api/contractor';

export const contractorsApi = {
  // Get all contractors
  getAll: async (): Promise<Contractor[]> => {
    const response = await axiosInstance.get<ApiResponse<Contractor[]>>(BASE_URL);
    return response.data.data;
  },

  // Get paginated contractors
  getPaginated: async (page: number = 1, limit: number = 10) => {
    const response = await axiosInstance.get<PaginatedResponse<Contractor>>(
      `${BASE_URL}?page=${page}&limit=${limit}`
    );
    return response.data.data;
  },

  // Get single contractor by ID
  getById: async (id: number): Promise<Contractor> => {
    const response = await axiosInstance.get<ApiResponse<Contractor>>(`${BASE_URL}/${id}`);
    return response.data.data;
  },

  // Create contractor
  create: async (data: Omit<Contractor, 'id'>): Promise<Contractor> => {
    const response = await axiosInstance.post<ApiResponse<Contractor>>(BASE_URL, data);
    return response.data.data;
  },

  // Update contractor
  update: async (id: number, data: Partial<Contractor>): Promise<Contractor> => {
    const response = await axiosInstance.put<ApiResponse<Contractor>>(`${BASE_URL}/${id}`, data);
    return response.data.data;
  },

  // Delete contractor
  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  },
};
