import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthState, Couple, User } from '@/types';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      couple: null,
      isLoading: true,
      isAuthenticated: false,

      setAuth: (user: User, token: string) =>
        set({ user, token, isAuthenticated: true, isLoading: false }),

      clearAuth: () =>
        set({ user: null, token: null, couple: null, isAuthenticated: false, isLoading: false }),

      setLoading: (val: boolean) => set({ isLoading: val }),

      setCouple: (couple: Couple) => set({ couple }),

      clearCouple: () => set({ couple: null }),
    }),
    {
      name: 'couply-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        couple: state.couple,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setLoading(false);
      },
    }
  )
);
