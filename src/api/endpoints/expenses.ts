import { apiClient } from '@/api/client';
import type { Expense, ExpenseFilters, ExpenseCreatePayload, ExpenseUpdatePayload } from '@/types';

export const expensesApi = {
  list: (filters?: ExpenseFilters) =>
    apiClient.get<Expense[]>('/expenses', { params: filters }),
  create: (data: ExpenseCreatePayload) =>
    apiClient.post<Expense>('/expenses', data),
  update: (id: string, data: ExpenseUpdatePayload) =>
    apiClient.put<Expense>(`/expenses/${id}`, data),
  delete: (id: string) =>
    apiClient.delete(`/expenses/${id}`),
};
