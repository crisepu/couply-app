import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ExpensesListScreen from '@/screens/app/expenses/ExpensesListScreen';
import { expensesApi } from '@/api/endpoints/expenses';
import { useAuthStore } from '@/store/useAuthStore';
import type { Expense } from '@/types';

jest.mock('@/api/endpoints/expenses');
jest.mock('@/api/client', () => ({}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}));
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (cb: () => void) => {
    const { useEffect } = require('react');
    useEffect(cb, []);
  },
}));

const mockNav = { navigate: jest.fn(), goBack: jest.fn() };

const sharedExpense: Expense = {
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

const personalExpense: Expense = {
  ...sharedExpense,
  id: 'exp-2',
  type: 'personal',
  category: 'transport',
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

describe('ExpensesListScreen', () => {
  it('renders section headers', async () => {
    (expensesApi.list as jest.Mock).mockResolvedValue({ data: [] });
    const { getByText } = render(
      <ExpensesListScreen navigation={mockNav as any} route={{} as any} />
    );
    await waitFor(() => {
      expect(getByText('expenses.shared')).toBeTruthy();
      expect(getByText('expenses.personal')).toBeTruthy();
    });
  });

  it('shows empty state when no expenses', async () => {
    (expensesApi.list as jest.Mock).mockResolvedValue({ data: [] });
    const { getAllByText } = render(
      <ExpensesListScreen navigation={mockNav as any} route={{} as any} />
    );
    await waitFor(() => {
      expect(getAllByText('expenses.noExpenses').length).toBeGreaterThanOrEqual(2);
    });
  });

  it('renders shared and personal expenses in correct sections', async () => {
    (expensesApi.list as jest.Mock).mockResolvedValue({ data: [sharedExpense, personalExpense] });
    const { getAllByText } = render(
      <ExpensesListScreen navigation={mockNav as any} route={{} as any} />
    );
    await waitFor(() => {
      expect(getAllByText('categories.groceries').length).toBe(1);
      expect(getAllByText('categories.transport').length).toBe(1);
    });
  });

  it('navigates to EditExpense on item press', async () => {
    (expensesApi.list as jest.Mock).mockResolvedValue({ data: [sharedExpense] });
    const { getByText } = render(
      <ExpensesListScreen navigation={mockNav as any} route={{} as any} />
    );
    await waitFor(() => getByText('categories.groceries'));
    fireEvent.press(getByText('categories.groceries'));
    expect(mockNav.navigate).toHaveBeenCalledWith('EditExpense', { expense: sharedExpense });
  });

  it('navigates to AddExpense on FAB press', async () => {
    (expensesApi.list as jest.Mock).mockResolvedValue({ data: [] });
    const { getByTestId } = render(
      <ExpensesListScreen navigation={mockNav as any} route={{} as any} />
    );
    await waitFor(() => {});
    fireEvent.press(getByTestId('fab-add-expense'));
    expect(mockNav.navigate).toHaveBeenCalledWith('AddExpense');
  });
});
