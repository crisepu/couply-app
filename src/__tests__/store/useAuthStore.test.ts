jest.mock('@/api/client', () => ({}));

import { act } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import type { Couple, User } from '@/types';

const mockUser: User = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  couple_id: null,
};

const mockCouple: Couple = {
  id: 'couple-1',
  user1_id: 'user-1',
  user2_id: null,
  split_mode: 'equal',
  percentage_user1: null,
  percentage_user2: null,
  invite_code: 'ABC123',
};

beforeEach(() => {
  useAuthStore.setState({
    user: null,
    token: null,
    couple: null,
    isAuthenticated: false,
    isLoading: false,
  });
});

describe('setAuth', () => {
  it('sets user, token and isAuthenticated', () => {
    useAuthStore.getState().setAuth(mockUser, 'token-123');
    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe('token-123');
    expect(state.isAuthenticated).toBe(true);
  });
});

describe('clearAuth', () => {
  it('clears user, token, couple and isAuthenticated', () => {
    useAuthStore.getState().setAuth(mockUser, 'token-123');
    useAuthStore.getState().setCouple(mockCouple);
    useAuthStore.getState().clearAuth();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.couple).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});

describe('setCouple', () => {
  it('stores couple in state', () => {
    useAuthStore.getState().setCouple(mockCouple);
    expect(useAuthStore.getState().couple).toEqual(mockCouple);
  });
});

describe('clearCouple', () => {
  it('resets couple to null', () => {
    useAuthStore.getState().setCouple(mockCouple);
    useAuthStore.getState().clearCouple();
    expect(useAuthStore.getState().couple).toBeNull();
  });
});

describe('couple completion logic', () => {
  it('couple is incomplete when user2_id is null', () => {
    useAuthStore.getState().setCouple(mockCouple);
    expect(useAuthStore.getState().couple?.user2_id).toBeNull();
  });

  it('couple is complete when user2_id is set', () => {
    const completeCouple: Couple = { ...mockCouple, user2_id: 'user-2' };
    useAuthStore.getState().setCouple(completeCouple);
    expect(useAuthStore.getState().couple?.user2_id).toBe('user-2');
  });
});
