import { apiClient } from '@/api/client';
import type { PublicUser } from '@/types';

export const usersApi = {
  getById: (userId: string) => apiClient.get<PublicUser>(`/users/${userId}`),
};
