import type { ApiResponse, PaginatedResponse, ConstructionStatus } from 'src/types/construction';

import axiosInstance from 'src/utils/axios';

// ----------------------------------------------------------------------

const BASE_URL = '/api/construction-status';

export const constructionStatusApi = {
  // Get all construction statuses
  getAll: async (): Promise<ConstructionStatus[]> => {
    const response = await axiosInstance.get<ApiResponse<ConstructionStatus[]>>(BASE_URL);
    return response.data.data;
  },

  // Get paginated construction statuses
  getPaginated: async (page: number = 1, limit: number = 10) => {
    const response = await axiosInstance.get<PaginatedResponse<ConstructionStatus>>(
      `${BASE_URL}?page=${page}&limit=${limit}`
    );
    return response.data.data;
  },

  // Get single construction status by ID
  getById: async (id: number): Promise<ConstructionStatus> => {
    const response = await axiosInstance.get<ApiResponse<ConstructionStatus>>(`${BASE_URL}/${id}`);
    return response.data.data;
  },

  // Create construction status
  create: async (data: Omit<ConstructionStatus, 'id'>): Promise<ConstructionStatus> => {
    const response = await axiosInstance.post<ApiResponse<ConstructionStatus>>(BASE_URL, data);
    return response.data.data;
  },

  // Update construction status
  update: async (id: number, data: Partial<ConstructionStatus>): Promise<ConstructionStatus> => {
    const response = await axiosInstance.put<ApiResponse<ConstructionStatus>>(
      `${BASE_URL}/${id}`,
      data
    );
    return response.data.data;
  },

  // Delete construction status
  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  },
};
