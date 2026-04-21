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
  coupleSetupComplete: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  setLoading: (val: boolean) => void;
  setCouple: (couple: Couple) => void;
  clearCouple: () => void;
  setCoupleSetupComplete: (val: boolean) => void;
}

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};

export interface Expense {
  id: string;
  couple_id: string;
  created_by: string;
  type: 'shared' | 'personal';
  amount: number;
  category: string;
  description: string | null;
  expense_date: string;
  paid_by: string;
  split_override_user1: number | null;
  split_override_user2: number | null;
  visible_to: string[];
}

export interface ExpenseFilters {
  type?: 'shared' | 'personal';
  month?: string;
}

export interface ExpenseCreatePayload {
  type: 'shared' | 'personal';
  amount: number;
  category: string;
  description?: string;
  expense_date: string;
  paid_by: string;
  split_override_user1?: number;
  split_override_user2?: number;
}

export type ExpenseUpdatePayload = Partial<ExpenseCreatePayload>;

export type MainTabParamList = {
  Home: undefined;
  Expenses: undefined;
  Profile: undefined;
};

export type ExpensesStackParamList = {
  ExpensesList: undefined;
  AddExpense: undefined;
  EditExpense: { expense: Expense };
};

export type AppStackParamList = {
  MainTabs: undefined;
  CoupleWelcome: undefined;
  CreateCouple: { splitDone?: boolean } | undefined;
  JoinCouple: undefined;
  SplitSetup: undefined;
  PartnerSplitReview: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};
