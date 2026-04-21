import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AddExpenseScreen from '@/screens/app/expenses/AddExpenseScreen';
import { expensesApi } from '@/api/endpoints/expenses';
import { useAuthStore } from '@/store/useAuthStore';

jest.mock('@/api/endpoints/expenses');
jest.mock('@/api/client', () => ({}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

const mockNav = { navigate: jest.fn(), goBack: jest.fn() };

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

describe('AddExpenseScreen', () => {
  it('renders type toggle with shared and personal options', () => {
    const { getByText } = render(
      <AddExpenseScreen navigation={mockNav as any} route={{} as any} />
    );
    expect(getByText('expenses.shared')).toBeTruthy();
    expect(getByText('expenses.personal')).toBeTruthy();
  });

  it('shows paid-by toggle when type is shared', () => {
    const { getByText } = render(
      <AddExpenseScreen navigation={mockNav as any} route={{} as any} />
    );
    expect(getByText('expenses.paidByMe')).toBeTruthy();
    expect(getByText('expenses.paidByPartner')).toBeTruthy();
  });

  it('hides paid-by toggle when type is personal', () => {
    const { getByText, queryByText } = render(
      <AddExpenseScreen navigation={mockNav as any} route={{} as any} />
    );
    fireEvent.press(getByText('expenses.personal'));
    expect(queryByText('expenses.paidByMe')).toBeNull();
    expect(queryByText('expenses.paidByPartner')).toBeNull();
  });

  it('shows custom split inputs when toggle is enabled', () => {
    const { getByRole, getByTestId } = render(
      <AddExpenseScreen navigation={mockNav as any} route={{} as any} />
    );
    const switchEl = getByRole('switch');
    fireEvent(switchEl, 'valueChange', true);
    expect(getByTestId('input-pct1')).toBeTruthy();
    expect(getByTestId('input-pct2')).toBeTruthy();
  });

  it('hides custom split toggle when type is personal', () => {
    const { getByText, queryByRole } = render(
      <AddExpenseScreen navigation={mockNav as any} route={{} as any} />
    );
    fireEvent.press(getByText('expenses.personal'));
    expect(queryByRole('switch')).toBeNull();
  });

  it('renders split percentage inputs with correct testIDs when custom split enabled', () => {
    const { getByRole, getByTestId } = render(
      <AddExpenseScreen navigation={mockNav as any} route={{} as any} />
    );
    fireEvent(getByRole('switch'), 'valueChange', true);
    const pct1 = getByTestId('input-pct1');
    const pct2 = getByTestId('input-pct2');
    fireEvent.changeText(pct1, '60');
    fireEvent.changeText(pct2, '40');
    expect(pct1.props.value).toBe('60');
    expect(pct2.props.value).toBe('40');
  });

  it('shows required validation errors when submitting empty form', async () => {
    const { getByText, getAllByText } = render(
      <AddExpenseScreen navigation={mockNav as any} route={{} as any} />
    );
    fireEvent.press(getByText('expenses.save'));
    await waitFor(() => {
      expect(getAllByText('errors.required').length).toBeGreaterThanOrEqual(1);
    });
    expect(expensesApi.create).not.toHaveBeenCalled();
  });
});
