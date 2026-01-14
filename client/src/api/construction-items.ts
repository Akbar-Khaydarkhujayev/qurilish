import type { ApiResponse, ConstructionItem, PaginatedResponse } from 'src/types/construction';

import axiosInstance from 'src/utils/axios';

// ----------------------------------------------------------------------

const BASE_URL = '/api/construction-items';

export const constructionItemsApi = {
  // Get all construction items
  getAll: async (): Promise<ConstructionItem[]> => {
    const response = await axiosInstance.get<ApiResponse<ConstructionItem[]>>(BASE_URL);
    return response.data.data;
  },

  // Get paginated construction items
  getPaginated: async (page: number = 1, limit: number = 10) => {
    const response = await axiosInstance.get<PaginatedResponse<ConstructionItem>>(
      `${BASE_URL}?page=${page}&limit=${limit}`
    );
    return response.data.data;
  },

  // Get single construction item by ID
  getById: async (id: number): Promise<ConstructionItem> => {
    const response = await axiosInstance.get<ApiResponse<ConstructionItem>>(`${BASE_URL}/${id}`);
    return response.data.data;
  },

  // Create construction item
  create: async (data: Omit<ConstructionItem, 'id'>): Promise<ConstructionItem> => {
    const response = await axiosInstance.post<ApiResponse<ConstructionItem>>(BASE_URL, data);
    return response.data.data;
  },

  // Update construction item
  update: async (id: number, data: Partial<ConstructionItem>): Promise<ConstructionItem> => {
    const response = await axiosInstance.put<ApiResponse<ConstructionItem>>(
      `${BASE_URL}/${id}`,
      data
    );
    return response.data.data;
  },

  // Delete construction item
  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  },
};
