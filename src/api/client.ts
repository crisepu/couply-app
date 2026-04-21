import axios from 'axios';
import Constants from 'expo-constants';
import { useAuthStore } from '@/store/useAuthStore';
import { firebaseAuth } from '@/lib/firebase';

const BASE_URL = (Constants.expoConfig!.extra!.apiBaseUrl as string) ?? 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const firebaseUser = firebaseAuth.currentUser;
        if (firebaseUser) {
          const freshToken = await firebaseUser.getIdToken(true);
          useAuthStore.getState().setAuth(
            useAuthStore.getState().user!,
            freshToken
          );
          originalRequest.headers.Authorization = `Bearer ${freshToken}`;
          return apiClient(originalRequest);
        }
      } catch {
        useAuthStore.getState().clearAuth();
      }
    }

    return Promise.reject(error);
  }
);
