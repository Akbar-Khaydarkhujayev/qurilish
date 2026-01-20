import { useQuery } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

export interface IOverallStats {
  totalBuildings: number;
  totalConstructionCost: number;
  newBuildingsCount: number;
  renovationCount: number;
  overdueCount: number;
  totalContracts: number;
  totalContractAmount: number;
}

export interface IStatusStats {
  id: number;
  statusName: string;
  buildingCount: number;
  totalCost: number;
}

export interface IRegionStats {
  id: number;
  regionName: string;
  buildingCount: number;
  totalCost: number;
  newBuildings: number;
  renovations: number;
}

export interface IFinancialStats {
  totalBudget: number;
  totalContractAmount: number;
  totalExpenses: number;
  totalInvoices: number;
}

export interface IBuilding {
  id: number;
  objectName: string;
  cardNumber: string | null;
  buildingType: 'new_building' | 'major_renovation';
  regionId: number | null;
  regionName: string | null;
  statusId: number | null;
  statusName: string | null;
  contractorId: number | null;
  contractorName: string | null;
  organizationId: number | null;
  organizationName: string | null;
  constructionCost: string | null;
  constructionEndDate: string | null;
  isOverdue: boolean;
  createdAt: string;
}

export interface IMonthlyStats {
  month: number;
  buildingCount: number;
  totalCost: number;
}

export interface IContractor {
  id: number;
  contractorName: string;
  buildingCount: number;
  totalCost: number;
}

export interface IOrganization {
  id: number;
  organizationName: string;
  buildingCount: number;
  totalCost: number;
}

export interface IDashboardStatistics {
  overall: IOverallStats;
  byStatus: IStatusStats[];
  byRegion: IRegionStats[];
  financial: IFinancialStats;
  buildings: IBuilding[];
  monthlyStats: IMonthlyStats[];
  contractors: IContractor[];
  organizations: IOrganization[];
}

interface IDashboardResponse {
  success: boolean;
  message: string;
  data: IDashboardStatistics;
}

const getDashboardStatistics = (): Promise<IDashboardResponse> =>
  axiosInstance.get('/dashboard/statistics').then((res) => res.data);

export const useGetDashboardStatistics = () =>
  useQuery({
    queryKey: ['dashboard-statistics'],
    queryFn: getDashboardStatistics,
  });
