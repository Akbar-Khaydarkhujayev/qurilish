import type { IReqParams } from 'src/types/global';
import type IPaginatedResponse from 'src/types/global';

import { useQuery } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

export interface IBuilding {
  id: number;
  card_number: string | null;
  object_name: string;
  address: string | null;
  region_id: number;
  region_name: string;
  district_id: number;
  district_name: string;
  construction_basis: string | null;
  project_organization_id: number;
  project_organization_name: string;
  object_passport: string | null;
  contractor_id: number;
  contractor_name: string;
  technical_supervisor_id: number | null;
  technical_supervisor_name: string | null;
  construction_start_date: string | null;
  construction_end_date: string | null;
  construction_status_id: number;
  status_name: string;
  construction_cost: string | null;
  organization_id: number;
  created_at: string;
  updated_at: string;
}

export interface IBuildingParams extends IReqParams {
  region_id?: number;
  district_id?: number;
  construction_status_id?: number;
  contractor_id?: number;
}

export const getBuildings = (params: IBuildingParams): Promise<IPaginatedResponse<IBuilding>> =>
  axiosInstance.get('/object-cards', { params }).then((res) => res.data);

export const useGetBuildings = (params: IBuildingParams) =>
  useQuery({
    queryKey: ['buildings', params],
    queryFn: () => getBuildings(params),
  });
