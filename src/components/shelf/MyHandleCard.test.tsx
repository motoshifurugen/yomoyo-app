import React from 'react';
import { screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import * as Clipboard from 'expo-clipboard';
import { renderWithTheme as render } from '@/lib/theme/testUtils';
import MyHandleCard from './MyHandleCard';
import { getUserHandle } from '@/lib/users/handles';

jest.mock('@/lib/users/handles', () => ({
  getUserHandle: jest.fn().mockResolvedValue('quietfox'),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const mockedGetUserHandle = getUserHandle as jest.Mock;
const mockedSetString = Clipboard.setStringAsync as jest.Mock;

describe('MyHandleCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetUserHandle.mockResolvedValue('quietfox');
    mockedSetString.mockResolvedValue(true);
  });

  it('renders the your-ID section title', () => {
    render(<MyHandleCard uid="user1" />);
    expect(screen.getByText('shelf.yourIdTitle')).toBeTruthy();
  });

  it('fetches the handle for the given uid on mount', async () => {
    render(<MyHandleCard uid="user1" />);
    await waitFor(() => expect(mockedGetUserHandle).toHaveBeenCalledWith('user1'));
  });

  it('displays the loaded handle', async () => {
    render(<MyHandleCard uid="user1" />);
    expect(await screen.findByText('quietfox')).toBeTruthy();
  });

  it('renders a copy-ID button', async () => {
    render(<MyHandleCard uid="user1" />);
    expect(await screen.findByText('shelf.copyId')).toBeTruthy();
  });

  it('copies the handle to the clipboard when pressed', async () => {
    render(<MyHandleCard uid="user1" />);
    await screen.findByText('quietfox');
    fireEvent.press(screen.getByTestId('copy-handle-button'));
    await waitFor(() => {
      expect(Clipboard.setStringAsync).toHaveBeenCalledWith('quietfox');
    });
  });

  it('shows the copied confirmation after pressing copy', async () => {
    render(<MyHandleCard uid="user1" />);
    await screen.findByText('quietfox');
    fireEvent.press(screen.getByTestId('copy-handle-button'));
    await waitFor(() => {
      expect(screen.getByText('shelf.idCopied')).toBeTruthy();
    });
  });

  it('does not show the copied confirmation initially', () => {
    render(<MyHandleCard uid="user1" />);
    expect(screen.queryByText('shelf.idCopied')).toBeNull();
  });

  it('does not crash when getUserHandle returns null', async () => {
    mockedGetUserHandle.mockResolvedValueOnce(null);
    render(<MyHandleCard uid="user1" />);
    await waitFor(() => expect(mockedGetUserHandle).toHaveBeenCalled());
    expect(screen.queryByText('quietfox')).toBeNull();
  });

  it('does not copy when handle is unavailable', async () => {
    mockedGetUserHandle.mockResolvedValueOnce(null);
    render(<MyHandleCard uid="user1" />);
    await waitFor(() => expect(mockedGetUserHandle).toHaveBeenCalled());
    fireEvent.press(screen.getByTestId('copy-handle-button'));
    expect(Clipboard.setStringAsync).not.toHaveBeenCalled();
  });

  it('hides the copied confirmation after a short delay', async () => {
    jest.useFakeTimers();
    try {
      render(<MyHandleCard uid="user1" />);
      await screen.findByText('quietfox');
      fireEvent.press(screen.getByTestId('copy-handle-button'));
      await waitFor(() => {
        expect(screen.getByText('shelf.idCopied')).toBeTruthy();
      });
      act(() => {
        jest.advanceTimersByTime(2500);
      });
      expect(screen.queryByText('shelf.idCopied')).toBeNull();
    } finally {
      jest.useRealTimers();
    }
  });
});
