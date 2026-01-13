import type { ApiResponse, Organization, PaginatedResponse } from 'src/types/construction';

import axiosInstance from 'src/utils/axios-instance';

// ----------------------------------------------------------------------

const BASE_URL = '/api/organizations';

export const organizationsApi = {
  // Get all organizations
  getAll: async (): Promise<Organization[]> => {
    const response = await axiosInstance.get<ApiResponse<Organization[]>>(BASE_URL);
    return response.data.data;
  },

  // Get paginated organizations
  getPaginated: async (page: number = 1, limit: number = 10) => {
    const response = await axiosInstance.get<PaginatedResponse<Organization>>(
      `${BASE_URL}?page=${page}&limit=${limit}`
    );
    return response.data.data;
  },

  // Get single organization by ID
  getById: async (id: number): Promise<Organization> => {
    const response = await axiosInstance.get<ApiResponse<Organization>>(`${BASE_URL}/${id}`);
    return response.data.data;
  },

  // Create organization
  create: async (data: Omit<Organization, 'id'>): Promise<Organization> => {
    const response = await axiosInstance.post<ApiResponse<Organization>>(BASE_URL, data);
    return response.data.data;
  },

  // Update organization
  update: async (id: number, data: Partial<Organization>): Promise<Organization> => {
    const response = await axiosInstance.put<ApiResponse<Organization>>(`${BASE_URL}/${id}`, data);
    return response.data.data;
  },

  // Delete organization
  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  },
};
