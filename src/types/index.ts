export interface User {
  id: string;
  email: string;
  name: string | null;
  couple_id: string | null;
}

export interface Couple {
  id: string;
  user1_id: string;
  user2_id: string | null;
  split_mode: 'equal' | 'custom' | 'auto';
  percentage_user1: number | null;
  percentage_user2: number | null;
  invite_code: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  couple: Couple | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  setLoading: (val: boolean) => void;
  setCouple: (couple: Couple) => void;
  clearCouple: () => void;
}

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};

export type AppStackParamList = {
  Home: undefined;
  CoupleWelcome: undefined;
  CreateCouple: undefined;
  JoinCouple: undefined;
  SplitSetup: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};
