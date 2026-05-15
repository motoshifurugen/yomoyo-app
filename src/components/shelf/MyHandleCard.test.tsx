import React from 'react';
import { screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Share } from 'react-native';
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

jest.spyOn(Share, 'share').mockResolvedValue({ action: Share.sharedAction });

describe('MyHandleCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetUserHandle.mockResolvedValue('quietfox');
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

  it('renders a share-ID button', async () => {
    render(<MyHandleCard uid="user1" />);
    expect(await screen.findByText('shelf.shareId')).toBeTruthy();
  });

  it('calls Share.share with the handle as the message when pressed', async () => {
    render(<MyHandleCard uid="user1" />);
    await screen.findByText('quietfox');
    fireEvent.press(screen.getByTestId('share-handle-button'));
    await waitFor(() => {
      expect(Share.share).toHaveBeenCalledWith({ message: 'quietfox' });
    });
  });

  it('shows the shared confirmation after pressing share', async () => {
    render(<MyHandleCard uid="user1" />);
    await screen.findByText('quietfox');
    fireEvent.press(screen.getByTestId('share-handle-button'));
    await waitFor(() => {
      expect(screen.getByText('shelf.idShared')).toBeTruthy();
    });
  });

  it('does not show the shared confirmation initially', () => {
    render(<MyHandleCard uid="user1" />);
    expect(screen.queryByText('shelf.idShared')).toBeNull();
  });

  it('does not crash when getUserHandle returns null', async () => {
    mockedGetUserHandle.mockResolvedValueOnce(null);
    render(<MyHandleCard uid="user1" />);
    await waitFor(() => expect(mockedGetUserHandle).toHaveBeenCalled());
    expect(screen.queryByText('quietfox')).toBeNull();
  });

  it('does not invoke Share when handle is unavailable', async () => {
    mockedGetUserHandle.mockResolvedValueOnce(null);
    render(<MyHandleCard uid="user1" />);
    await waitFor(() => expect(mockedGetUserHandle).toHaveBeenCalled());
    fireEvent.press(screen.getByTestId('share-handle-button'));
    expect(Share.share).not.toHaveBeenCalled();
  });

  it('hides the shared confirmation after a short delay', async () => {
    jest.useFakeTimers();
    try {
      render(<MyHandleCard uid="user1" />);
      await screen.findByText('quietfox');
      fireEvent.press(screen.getByTestId('share-handle-button'));
      await waitFor(() => {
        expect(screen.getByText('shelf.idShared')).toBeTruthy();
      });
      act(() => {
        jest.advanceTimersByTime(2500);
      });
      expect(screen.queryByText('shelf.idShared')).toBeNull();
    } finally {
      jest.useRealTimers();
    }
  });
});
