import type { ApiResponse, PaginatedResponse, ProjectOrganization } from 'src/types/construction';

import axiosInstance from 'src/utils/axios';

// ----------------------------------------------------------------------

const BASE_URL = '/api/project-organization';

export const projectOrganizationsApi = {
  // Get all project organizations
  getAll: async (): Promise<ProjectOrganization[]> => {
    const response = await axiosInstance.get<ApiResponse<ProjectOrganization[]>>(BASE_URL);
    return response.data.data;
  },

  // Get paginated project organizations
  getPaginated: async (page: number = 1, limit: number = 10) => {
    const response = await axiosInstance.get<PaginatedResponse<ProjectOrganization>>(
      `${BASE_URL}?page=${page}&limit=${limit}`
    );
    return response.data.data;
  },

  // Get single project organization by ID
  getById: async (id: number): Promise<ProjectOrganization> => {
    const response = await axiosInstance.get<ApiResponse<ProjectOrganization>>(`${BASE_URL}/${id}`);
    return response.data.data;
  },

  // Create project organization
  create: async (data: Omit<ProjectOrganization, 'id'>): Promise<ProjectOrganization> => {
    const response = await axiosInstance.post<ApiResponse<ProjectOrganization>>(BASE_URL, data);
    return response.data.data;
  },

  // Update project organization
  update: async (id: number, data: Partial<ProjectOrganization>): Promise<ProjectOrganization> => {
    const response = await axiosInstance.put<ApiResponse<ProjectOrganization>>(
      `${BASE_URL}/${id}`,
      data
    );
    return response.data.data;
  },

  // Delete project organization
  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  },
};
