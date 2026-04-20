import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SplitSetupScreen from '@/screens/app/couple/SplitSetupScreen';
import { coupleApi } from '@/api/endpoints/couple';
import { authApi } from '@/api/endpoints/auth';
import { useAuthStore } from '@/store/useAuthStore';
import type { Couple } from '@/types';

jest.mock('@/api/endpoints/couple');
jest.mock('@/api/endpoints/auth');
jest.mock('@/api/client', () => ({}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const mockCouple: Couple = {
  id: 'couple-1',
  user1_id: 'user-1',
  user2_id: 'user-2',
  split_mode: 'equal',
  percentage_user1: null,
  percentage_user2: null,
  invite_code: 'ABC123XY',
};

beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState({ user: null, token: null, couple: null, isAuthenticated: false, isLoading: false });
  (coupleApi.updateSplit as jest.Mock).mockResolvedValue({ data: mockCouple });
  (authApi.updateMe as jest.Mock).mockResolvedValue({ data: {} });
});

describe('SplitSetupScreen', () => {
  it('renders three split mode options', () => {
    const { getByText } = render(<SplitSetupScreen />);
    expect(getByText('couple.splitEqual')).toBeTruthy();
    expect(getByText('couple.splitCustom')).toBeTruthy();
    expect(getByText('couple.splitAuto')).toBeTruthy();
  });

  it('calls updateSplit with equal mode on confirm', async () => {
    const { getByText } = render(<SplitSetupScreen />);
    fireEvent.press(getByText('couple.splitConfirm'));
    await waitFor(() => {
      expect(coupleApi.updateSplit).toHaveBeenCalledWith({ split_mode: 'equal' });
    });
  });

  it('shows percentage inputs when custom is selected', () => {
    const { getByText, getByTestId } = render(<SplitSetupScreen />);
    fireEvent.press(getByText('couple.splitCustom'));
    expect(getByTestId('input-pct1')).toBeTruthy();
    expect(getByTestId('input-pct2')).toBeTruthy();
  });

  it('shows validation error when custom percentages do not sum to 100', async () => {
    const { getByText, getByTestId } = render(<SplitSetupScreen />);
    fireEvent.press(getByText('couple.splitCustom'));
    fireEvent.changeText(getByTestId('input-pct1'), '60');
    fireEvent.changeText(getByTestId('input-pct2'), '50');
    fireEvent.press(getByText('couple.splitConfirm'));
    await waitFor(() => {
      expect(getByText('couple.percentagesError')).toBeTruthy();
    });
    expect(coupleApi.updateSplit).not.toHaveBeenCalled();
  });

  it('calls updateSplit with custom percentages when they sum to 100', async () => {
    const { getByText, getByTestId } = render(<SplitSetupScreen />);
    fireEvent.press(getByText('couple.splitCustom'));
    fireEvent.changeText(getByTestId('input-pct1'), '60');
    fireEvent.changeText(getByTestId('input-pct2'), '40');
    fireEvent.press(getByText('couple.splitConfirm'));
    await waitFor(() => {
      expect(coupleApi.updateSplit).toHaveBeenCalledWith({
        split_mode: 'custom',
        percentage_user1: 60,
        percentage_user2: 40,
      });
    });
  });

  it('shows salary input when auto is selected', () => {
    const { getByText, getByTestId } = render(<SplitSetupScreen />);
    fireEvent.press(getByText('couple.splitAuto'));
    expect(getByTestId('input-salary')).toBeTruthy();
  });

  it('calls updateMe and updateSplit when auto mode is confirmed', async () => {
    const { getByText, getByTestId } = render(<SplitSetupScreen />);
    fireEvent.press(getByText('couple.splitAuto'));
    fireEvent.changeText(getByTestId('input-salary'), '5000');
    fireEvent.press(getByText('couple.splitConfirm'));
    await waitFor(() => {
      expect(authApi.updateMe).toHaveBeenCalledWith({ salary: 5000 });
      expect(coupleApi.updateSplit).toHaveBeenCalledWith({ split_mode: 'auto' });
    });
  });
});
