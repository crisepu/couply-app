import { expensesApi } from '@/api/endpoints/expenses';
import { apiClient } from '@/api/client';
import type { Expense } from '@/types';

jest.mock('@/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedClient = apiClient as jest.Mocked<typeof apiClient>;

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

beforeEach(() => jest.clearAllMocks());

describe('expensesApi.list', () => {
  it('calls GET /expenses without filters', async () => {
    mockedClient.get.mockResolvedValueOnce({ data: [mockExpense] });
    const result = await expensesApi.list();
    expect(mockedClient.get).toHaveBeenCalledWith('/expenses', { params: undefined });
    expect(result.data).toHaveLength(1);
  });

  it('calls GET /expenses with month filter', async () => {
    mockedClient.get.mockResolvedValueOnce({ data: [mockExpense] });
    await expensesApi.list({ month: '2026-04' });
    expect(mockedClient.get).toHaveBeenCalledWith('/expenses', { params: { month: '2026-04' } });
  });

  it('calls GET /expenses with type filter', async () => {
    mockedClient.get.mockResolvedValueOnce({ data: [] });
    await expensesApi.list({ type: 'personal' });
    expect(mockedClient.get).toHaveBeenCalledWith('/expenses', { params: { type: 'personal' } });
  });
});

describe('expensesApi.create', () => {
  it('calls POST /expenses with payload', async () => {
    mockedClient.post.mockResolvedValueOnce({ data: mockExpense });
    const payload = {
      type: 'shared' as const,
      amount: 5000,
      category: 'groceries',
      expense_date: '2026-04-20',
      paid_by: 'user-1',
    };
    await expensesApi.create(payload);
    expect(mockedClient.post).toHaveBeenCalledWith('/expenses', payload);
  });

  it('includes split_override when provided', async () => {
    mockedClient.post.mockResolvedValueOnce({ data: mockExpense });
    const payload = {
      type: 'shared' as const,
      amount: 10000,
      category: 'rent',
      expense_date: '2026-04-01',
      paid_by: 'user-1',
      split_override_user1: 60,
      split_override_user2: 40,
    };
    await expensesApi.create(payload);
    expect(mockedClient.post).toHaveBeenCalledWith('/expenses', payload);
  });
});

describe('expensesApi.update', () => {
  it('calls PUT /expenses/:id with payload', async () => {
    const updated = { ...mockExpense, amount: 6000 };
    mockedClient.put.mockResolvedValueOnce({ data: updated });
    await expensesApi.update('exp-1', { amount: 6000 });
    expect(mockedClient.put).toHaveBeenCalledWith('/expenses/exp-1', { amount: 6000 });
  });
});

describe('expensesApi.delete', () => {
  it('calls DELETE /expenses/:id', async () => {
    mockedClient.delete.mockResolvedValueOnce({ data: null });
    await expensesApi.delete('exp-1');
    expect(mockedClient.delete).toHaveBeenCalledWith('/expenses/exp-1');
  });
});
