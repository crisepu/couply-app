import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthState, User } from '@/types';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: true,
      isAuthenticated: false,

      setAuth: (user: User, token: string) =>
        set({ user, token, isAuthenticated: true, isLoading: false }),

      clearAuth: () =>
        set({ user: null, token: null, isAuthenticated: false, isLoading: false }),

      setLoading: (val: boolean) => set({ isLoading: val }),
    }),
    {
      name: 'couply-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setLoading(false);
      },
    }
  )
);
