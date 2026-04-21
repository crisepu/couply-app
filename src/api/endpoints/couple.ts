import { apiClient } from '@/api/client';
import type { Couple } from '@/types';

interface UpdateSplitPayload {
  split_mode: 'equal' | 'custom' | 'auto';
  percentage_user1?: number;
  percentage_user2?: number;
}

export const coupleApi = {
  create: () => apiClient.post<Couple>('/couple'),
  join: (invite_code: string) => apiClient.post<Couple>('/couple/join', { invite_code }),
  get: () => apiClient.get<Couple>('/couple'),
  updateSplit: (payload: UpdateSplitPayload) => apiClient.put<Couple>('/couple/split', payload),
};
