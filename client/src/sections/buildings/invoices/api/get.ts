import { useQuery } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

export interface IInvoice {
  id: number;
  object_card_id: number;
  object_contract_id: number;
  document_number: string | null;
  document_date: string | null;
  amount: number | null;
  description: string | null;
  object_name: string;
  card_number: string;
  contract_number: string | null;
  contract_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface IInvoicesResponse {
  invoices: IInvoice[];
  totalAmount: number;
  count: number;
}

export const getInvoicesByObjectCard = (objectCardId: string): Promise<IInvoicesResponse> =>
  axiosInstance.get(`/object-cards/${objectCardId}/invoices`).then((res) => ({
    ...res.data.data,
    invoices: res.data.data.invoices.map((item: IInvoice) => ({
      ...item,
      amount: item.amount ? Number(item.amount) : null,
    })),
  }));

export const useGetInvoicesByObjectCard = (objectCardId: string) =>
  useQuery({
    queryKey: ['invoices', objectCardId],
    queryFn: () => getInvoicesByObjectCard(objectCardId),
    enabled: !!objectCardId,
  });
