import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import HomeScreen from '@/screens/app/HomeScreen';
import { balanceApi } from '@/api/endpoints/balance';
import { expensesApi } from '@/api/endpoints/expenses';
import { useAuthStore } from '@/store/useAuthStore';
import type { BalanceResponse, Expense } from '@/types';

jest.mock('@/api/endpoints/balance');
jest.mock('@/api/endpoints/expenses');
jest.mock('@/api/client', () => ({}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (cb: () => void) => {
    const { useEffect } = require('react');
    useEffect(cb, []);
  },
}));

const mockNav = { navigate: jest.fn() };

const settledBalance: BalanceResponse = {
  user1_id: 'user-1',
  user2_id: 'user-2',
  balance: 0,
  debtor: null,
  creditor: null,
};

const debtorBalance: BalanceResponse = {
  user1_id: 'user-1',
  user2_id: 'user-2',
  balance: 5000,
  debtor: 'user-1',
  creditor: 'user-2',
};

const creditorBalance: BalanceResponse = {
  user1_id: 'user-1',
  user2_id: 'user-2',
  balance: 3000,
  debtor: 'user-2',
  creditor: 'user-1',
};

const mockExpense: Expense = {
  id: 'exp-1',
  couple_id: 'couple-1',
  created_by: 'user-1',
  type: 'shared',
  amount: 5000,
  category: 'groceries',
  description: null,
  expense_date: '2026-04-20',
  paid_by: 'user-1',
  split_override_user1: null,
  split_override_user2: null,
  visible_to: ['user-1', 'user-2'],
};

beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState({
    user: { id: 'user-1', email: 'me@test.com', name: 'Me', couple_id: 'couple-1' },
    token: 'tok',
    couple: {
      id: 'couple-1', user1_id: 'user-1', user2_id: 'user-2',
      split_mode: 'equal', percentage_user1: null, percentage_user2: null, invite_code: 'X',
    },
    isAuthenticated: true,
    isLoading: false,
  });
});

describe('HomeScreen', () => {
  it('shows settled up message when debtor is null', async () => {
    (balanceApi.get as jest.Mock).mockResolvedValue({ data: settledBalance });
    (expensesApi.list as jest.Mock).mockResolvedValue({ data: [] });
    const { getByText } = render(<HomeScreen navigation={mockNav as any} route={{} as any} />);
    await waitFor(() => expect(getByText('home.settledUp')).toBeTruthy());
  });

  it('shows "you owe" when current user is debtor', async () => {
    (balanceApi.get as jest.Mock).mockResolvedValue({ data: debtorBalance });
    (expensesApi.list as jest.Mock).mockResolvedValue({ data: [] });
    const { getByText } = render(<HomeScreen navigation={mockNav as any} route={{} as any} />);
    await waitFor(() => expect(getByText('home.youOwe')).toBeTruthy());
  });

  it('shows balance amount when not settled', async () => {
    (balanceApi.get as jest.Mock).mockResolvedValue({ data: debtorBalance });
    (expensesApi.list as jest.Mock).mockResolvedValue({ data: [] });
    const { getByText } = render(<HomeScreen navigation={mockNav as any} route={{} as any} />);
    await waitFor(() => expect(getByText('$5000.00')).toBeTruthy());
  });

  it('shows "partner owes" when current user is creditor', async () => {
    (balanceApi.get as jest.Mock).mockResolvedValue({ data: creditorBalance });
    (expensesApi.list as jest.Mock).mockResolvedValue({ data: [] });
    const { getByText } = render(<HomeScreen navigation={mockNav as any} route={{} as any} />);
    await waitFor(() => expect(getByText('home.partnerOwes')).toBeTruthy());
  });

  it('shows split mode label', async () => {
    (balanceApi.get as jest.Mock).mockResolvedValue({ data: settledBalance });
    (expensesApi.list as jest.Mock).mockResolvedValue({ data: [] });
    const { getByText } = render(<HomeScreen navigation={mockNav as any} route={{} as any} />);
    await waitFor(() => expect(getByText('home.splitEqual')).toBeTruthy());
  });

  it('shows empty state when no expenses', async () => {
    (balanceApi.get as jest.Mock).mockResolvedValue({ data: settledBalance });
    (expensesApi.list as jest.Mock).mockResolvedValue({ data: [] });
    const { getByText } = render(<HomeScreen navigation={mockNav as any} route={{} as any} />);
    await waitFor(() => expect(getByText('home.noExpenses')).toBeTruthy());
  });

  it('renders recent shared expenses', async () => {
    (balanceApi.get as jest.Mock).mockResolvedValue({ data: settledBalance });
    (expensesApi.list as jest.Mock).mockResolvedValue({ data: [mockExpense] });
    const { getByText } = render(<HomeScreen navigation={mockNav as any} route={{} as any} />);
    await waitFor(() => expect(getByText('categories.groceries')).toBeTruthy());
  });

  it('shows at most 5 recent expenses', async () => {
    const expenses = Array.from({ length: 8 }, (_, i) => ({ ...mockExpense, id: `exp-${i}` }));
    (balanceApi.get as jest.Mock).mockResolvedValue({ data: settledBalance });
    (expensesApi.list as jest.Mock).mockResolvedValue({ data: expenses });
    const { getAllByText } = render(<HomeScreen navigation={mockNav as any} route={{} as any} />);
    await waitFor(() => {
      expect(getAllByText('categories.groceries').length).toBe(5);
    });
  });

  it('"see all" navigates to Expenses tab', async () => {
    (balanceApi.get as jest.Mock).mockResolvedValue({ data: settledBalance });
    (expensesApi.list as jest.Mock).mockResolvedValue({ data: [] });
    const { getByText } = render(<HomeScreen navigation={mockNav as any} route={{} as any} />);
    await waitFor(() => getByText('home.seeAll'));
    fireEvent.press(getByText('home.seeAll'));
    expect(mockNav.navigate).toHaveBeenCalledWith('Expenses');
  });

  it('"add expense" navigates toward AddExpense', async () => {
    (balanceApi.get as jest.Mock).mockResolvedValue({ data: settledBalance });
    (expensesApi.list as jest.Mock).mockResolvedValue({ data: [] });
    const { getByText } = render(<HomeScreen navigation={mockNav as any} route={{} as any} />);
    await waitFor(() => getByText('home.addExpense'));
    fireEvent.press(getByText('home.addExpense'));
    expect(mockNav.navigate).toHaveBeenCalledWith('Expenses', expect.objectContaining({ screen: 'AddExpense' }));
  });
});
