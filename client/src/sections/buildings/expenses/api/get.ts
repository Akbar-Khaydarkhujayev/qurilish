import { useQuery } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

export interface IExpense {
  id: number;
  object_card_id: number;
  object_contract_id: number;
  registry_number: string | null;
  registry_date: string | null;
  amount: number | null;
  description: string | null;
  object_name: string;
  card_number: string;
  contract_number: string | null;
  contract_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface IExpensesResponse {
  expenses: IExpense[];
  totalAmount: number;
  count: number;
}

export const getExpensesByObjectCard = (objectCardId: string): Promise<IExpensesResponse> =>
  axiosInstance.get(`/object-cards/${objectCardId}/expenses`).then((res) => ({
    ...res.data.data,
    expenses: res.data.data.expenses.map((item: IExpense) => ({
      ...item,
      amount: item.amount ? Number(item.amount) : null,
    })),
  }));

export const useGetExpensesByObjectCard = (objectCardId: string) =>
  useQuery({
    queryKey: ['expenses', objectCardId],
    queryFn: () => getExpensesByObjectCard(objectCardId),
    enabled: !!objectCardId,
  });
