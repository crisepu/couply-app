import { coupleApi } from '@/api/endpoints/couple';
import { apiClient } from '@/api/client';
import type { Couple } from '@/types';

jest.mock('@/api/client', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
  },
}));

const mockedClient = apiClient as jest.Mocked<typeof apiClient>;

const mockCouple: Couple = {
  id: 'couple-1',
  user1_id: 'user-1',
  user2_id: null,
  split_mode: 'equal',
  percentage_user1: null,
  percentage_user2: null,
  invite_code: 'ABC123XY',
};

beforeEach(() => jest.clearAllMocks());

describe('coupleApi.create', () => {
  it('calls POST /couple', async () => {
    mockedClient.post.mockResolvedValueOnce({ data: mockCouple });
    await coupleApi.create();
    expect(mockedClient.post).toHaveBeenCalledWith('/couple');
  });
});

describe('coupleApi.join', () => {
  it('calls POST /couple/join with invite_code', async () => {
    const joined = { ...mockCouple, user2_id: 'user-2' };
    mockedClient.post.mockResolvedValueOnce({ data: joined });
    const result = await coupleApi.join('ABC123XY');
    expect(mockedClient.post).toHaveBeenCalledWith('/couple/join', { invite_code: 'ABC123XY' });
    expect(result.data.user2_id).toBe('user-2');
  });
});

describe('coupleApi.get', () => {
  it('calls GET /couple', async () => {
    mockedClient.get.mockResolvedValueOnce({ data: mockCouple });
    await coupleApi.get();
    expect(mockedClient.get).toHaveBeenCalledWith('/couple');
  });
});

describe('coupleApi.updateSplit', () => {
  it('calls PUT /couple/split with equal mode', async () => {
    mockedClient.put.mockResolvedValueOnce({ data: mockCouple });
    await coupleApi.updateSplit({ split_mode: 'equal' });
    expect(mockedClient.put).toHaveBeenCalledWith('/couple/split', { split_mode: 'equal' });
  });

  it('calls PUT /couple/split with custom percentages', async () => {
    const custom = { ...mockCouple, split_mode: 'custom' as const, percentage_user1: 60, percentage_user2: 40 };
    mockedClient.put.mockResolvedValueOnce({ data: custom });
    await coupleApi.updateSplit({ split_mode: 'custom', percentage_user1: 60, percentage_user2: 40 });
    expect(mockedClient.put).toHaveBeenCalledWith('/couple/split', {
      split_mode: 'custom',
      percentage_user1: 60,
      percentage_user2: 40,
    });
  });

  it('calls PUT /couple/split with auto mode', async () => {
    mockedClient.put.mockResolvedValueOnce({ data: { ...mockCouple, split_mode: 'auto' } });
    await coupleApi.updateSplit({ split_mode: 'auto' });
    expect(mockedClient.put).toHaveBeenCalledWith('/couple/split', { split_mode: 'auto' });
  });
});
