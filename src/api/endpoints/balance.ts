import { apiClient } from '@/api/client';
import type { BalanceResponse } from '@/types';

export const balanceApi = {
  get: () => apiClient.get<BalanceResponse>('/balance'),
};
