import type { IFile } from 'src/sections/buildings/files/api/get';
import type { IInvoice } from 'src/sections/buildings/invoices/api/get';
import type { IExpense } from 'src/sections/buildings/expenses/api/get';
import type { IContract } from 'src/sections/buildings/contracts/api/get';
import type { IEstimate } from 'src/sections/buildings/estimates/api/get';
import type { ISubObject } from 'src/sections/buildings/sub-objects/api/get';

import { useQuery } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

export interface IBuildingDetails {
  id: number;
  card_number: string | null;
  object_name: string;
  address: string | null;
  building_type: 'new_building' | 'major_renovation';
  construction_basis: string | null;
  construction_cost: string | null;
  construction_start_date: string | null;
  construction_end_date: string | null;
  region_id: number | null;
  region_name: string | null;
  district_id: number | null;
  district_name: string | null;
  construction_status_id: number | null;
  status_name: string | null;
  contractor_id: number | null;
  contractor_name: string | null;
  contractor_tax_id: string | null;
  contractor_address: string | null;
  contractor_phone: string | null;
  organization_id: number | null;
  organization_name: string | null;
  project_organization_id: number | null;
  project_organization_name: string | null;
  project_org_tax_id: string | null;
  project_org_address: string | null;
  project_org_phone: string | null;
  technical_supervisor_id: number | null;
  technical_supervisor_name: string | null;
  technical_supervisor_email: string | null;
  technical_supervisor_phone: string | null;
  camera_login: string | null;
  camera_password: string | null;
  camera_ip: string | null;
  created_at: string;
}

export interface IBuildingImage {
  id: number;
  object_card_id: number;
  path: string;
  file_name: string;
  sort_order: number;
  created_at: string;
}

export interface IBuildingFullDetails {
  building: IBuildingDetails;
  subObjects: ISubObject[];
  contracts: IContract[];
  estimates: IEstimate[];
  expenses: { expenses: IExpense[]; totalAmount: number; count: number };
  invoices: { invoices: IInvoice[]; totalAmount: number; count: number };
  files: { files: IFile[]; count: number };
  images: IBuildingImage[];
}

const getBuildingFullDetails = async (id: number): Promise<IBuildingFullDetails> => {
  const [
    buildingRes,
    subObjectsRes,
    contractsRes,
    estimatesRes,
    expensesRes,
    invoicesRes,
    filesRes,
    imagesRes,
  ] = await Promise.all([
    axiosInstance.get(`/object-cards/${id}`),
    axiosInstance.get(`/object-cards/${id}/sub-objects`),
    axiosInstance.get(`/object-cards/${id}/contracts`),
    axiosInstance.get(`/object-cards/${id}/estimates`),
    axiosInstance.get(`/object-cards/${id}/expenses`),
    axiosInstance.get(`/object-cards/${id}/invoices`),
    axiosInstance.get(`/object-cards/${id}/files`),
    axiosInstance.get(`/object-cards/${id}/images`),
  ]);

  return {
    building: buildingRes.data.data,
    subObjects: subObjectsRes.data.data.map((item: ISubObject) => ({
      ...item,
      cost: item.cost ? Number(item.cost) : null,
    })),
    contracts: contractsRes.data.data.map((item: IContract) => ({
      ...item,
      contract_amount: item.contract_amount ? Number(item.contract_amount) : null,
    })),
    estimates: estimatesRes.data.data.map((item: IEstimate) => ({
      ...item,
      month_1: item.month_1 ? Number(item.month_1) : 0,
      month_2: item.month_2 ? Number(item.month_2) : 0,
      month_3: item.month_3 ? Number(item.month_3) : 0,
      month_4: item.month_4 ? Number(item.month_4) : 0,
      month_5: item.month_5 ? Number(item.month_5) : 0,
      month_6: item.month_6 ? Number(item.month_6) : 0,
      month_7: item.month_7 ? Number(item.month_7) : 0,
      month_8: item.month_8 ? Number(item.month_8) : 0,
      month_9: item.month_9 ? Number(item.month_9) : 0,
      month_10: item.month_10 ? Number(item.month_10) : 0,
      month_11: item.month_11 ? Number(item.month_11) : 0,
      month_12: item.month_12 ? Number(item.month_12) : 0,
      year_total: item.year_total ? Number(item.year_total) : 0,
    })),
    expenses: {
      ...expensesRes.data.data,
      expenses: expensesRes.data.data.expenses.map((item: IExpense) => ({
        ...item,
        amount: item.amount ? Number(item.amount) : null,
      })),
    },
    invoices: {
      ...invoicesRes.data.data,
      invoices: invoicesRes.data.data.invoices.map((item: IInvoice) => ({
        ...item,
        amount: item.amount ? Number(item.amount) : null,
      })),
    },
    files: filesRes.data.data,
    images: imagesRes.data.data || [],
  };
};

export const useGetBuildingFullDetails = (id: number | null) =>
  useQuery({
    queryKey: ['building-full-details', id],
    queryFn: () => getBuildingFullDetails(id!),
    enabled: !!id,
  });
