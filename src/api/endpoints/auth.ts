import { apiClient } from '@/api/client';
import type { User } from '@/types';

export const authApi = {
  register: async (): Promise<{ data: User }> => {
    try {
      return await apiClient.post('/auth/register');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status: number } };
      // User already registered (reinstall scenario) — fetch existing profile
      if (axiosErr?.response?.status === 409) {
        return apiClient.get('/auth/me');
      }
      throw err;
    }
  },

  getMe: (): Promise<{ data: User }> =>
    apiClient.get('/auth/me'),

  updateMe: (payload: { name?: string; salary?: number }): Promise<{ data: User }> =>
    apiClient.patch('/auth/me', payload),

  getMySalary: (): Promise<{ data: { salary: number | null } }> =>
    apiClient.get('/auth/me/salary'),
};
