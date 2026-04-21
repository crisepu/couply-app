import { balanceApi } from '@/api/endpoints/balance';
import { apiClient } from '@/api/client';
import type { BalanceResponse } from '@/types';

jest.mock('@/api/client', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

const mockedClient = apiClient as jest.Mocked<typeof apiClient>;

const mockBalance: BalanceResponse = {
  user1_id: 'user-1',
  user2_id: 'user-2',
  balance: 5000,
  debtor: 'user-2',
  creditor: 'user-1',
};

beforeEach(() => jest.clearAllMocks());

describe('balanceApi.get', () => {
  it('calls GET /balance', async () => {
    mockedClient.get.mockResolvedValueOnce({ data: mockBalance });
    await balanceApi.get();
    expect(mockedClient.get).toHaveBeenCalledWith('/balance');
  });

  it('returns BalanceResponse shape', async () => {
    mockedClient.get.mockResolvedValueOnce({ data: mockBalance });
    const result = await balanceApi.get();
    expect(result.data.user1_id).toBe('user-1');
    expect(result.data.balance).toBe(5000);
    expect(result.data.debtor).toBe('user-2');
  });

  it('handles settled state (debtor null)', async () => {
    const settled = { ...mockBalance, balance: 0, debtor: null, creditor: null };
    mockedClient.get.mockResolvedValueOnce({ data: settled });
    const result = await balanceApi.get();
    expect(result.data.debtor).toBeNull();
    expect(result.data.creditor).toBeNull();
  });
});
