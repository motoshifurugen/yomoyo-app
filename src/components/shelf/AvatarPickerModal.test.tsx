import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithTheme as render } from '@/lib/theme/testUtils';
import { ThemeProvider } from '@/lib/theme';
import AvatarPickerModal from './AvatarPickerModal';
import { saveAvatarIdentity } from '@/lib/users/avatarIdentity';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/lib/users/avatarIdentity', () => {
  const actual = jest.requireActual('@/lib/users/avatarIdentity');
  return {
    ...actual,
    saveAvatarIdentity: jest.fn(() => Promise.resolve()),
  };
});

const mockedSave = saveAvatarIdentity as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockedSave.mockResolvedValue(undefined);
});

const baseProps = {
  uid: 'user1',
  displayName: 'Foxy',
  selectedAnimalKey: 'fox' as const,
};

describe('AvatarPickerModal', () => {
  it('does not render the animal grid when not visible', () => {
    render(<AvatarPickerModal {...baseProps} visible={false} onClose={jest.fn()} />);
    expect(screen.queryByTestId('animal-grid-picker')).toBeNull();
  });

  it('renders the animal grid when visible', () => {
    render(<AvatarPickerModal {...baseProps} visible onClose={jest.fn()} />);
    expect(screen.getByTestId('animal-grid-picker')).toBeTruthy();
  });

  it('calls saveAvatarIdentity with the tapped animal key and current displayName', async () => {
    render(<AvatarPickerModal {...baseProps} visible onClose={jest.fn()} />);
    fireEvent.press(screen.getByTestId('animal-cell-bear'));
    await waitFor(() => {
      expect(mockedSave).toHaveBeenCalledWith('user1', {
        animalKey: 'bear',
        displayName: 'Foxy',
      });
    });
  });

  it('calls onClose after a successful save', async () => {
    const onClose = jest.fn();
    render(<AvatarPickerModal {...baseProps} visible onClose={onClose} />);
    fireEvent.press(screen.getByTestId('animal-cell-bear'));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('does not call onClose when the save fails', async () => {
    mockedSave.mockRejectedValueOnce(new Error('boom'));
    const onClose = jest.fn();
    render(<AvatarPickerModal {...baseProps} visible onClose={onClose} />);
    fireEvent.press(screen.getByTestId('animal-cell-bear'));
    await waitFor(() => expect(mockedSave).toHaveBeenCalled());
    expect(onClose).not.toHaveBeenCalled();
  });

  it('exposes a close button that calls onClose without saving', () => {
    const onClose = jest.fn();
    render(<AvatarPickerModal {...baseProps} visible onClose={onClose} />);
    fireEvent.press(screen.getByTestId('avatar-picker-close'));
    expect(onClose).toHaveBeenCalled();
    expect(mockedSave).not.toHaveBeenCalled();
  });

  it('shows a save error when saveAvatarIdentity rejects', async () => {
    mockedSave.mockRejectedValueOnce(new Error('boom'));
    render(<AvatarPickerModal {...baseProps} visible onClose={jest.fn()} />);
    fireEvent.press(screen.getByTestId('animal-cell-bear'));
    await waitFor(() => {
      expect(screen.getByTestId('avatar-picker-save-error')).toBeTruthy();
    });
  });

  it('allows retrying after a failed save', async () => {
    mockedSave.mockRejectedValueOnce(new Error('boom'));
    const onClose = jest.fn();
    render(<AvatarPickerModal {...baseProps} visible onClose={onClose} />);
    fireEvent.press(screen.getByTestId('animal-cell-bear'));
    await waitFor(() => expect(screen.getByTestId('avatar-picker-save-error')).toBeTruthy());
    mockedSave.mockResolvedValueOnce(undefined);
    fireEvent.press(screen.getByTestId('animal-cell-eagle'));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('clears the save error on a subsequent successful save', async () => {
    mockedSave.mockRejectedValueOnce(new Error('boom'));
    render(<AvatarPickerModal {...baseProps} visible onClose={jest.fn()} />);
    fireEvent.press(screen.getByTestId('animal-cell-bear'));
    await waitFor(() => expect(screen.getByTestId('avatar-picker-save-error')).toBeTruthy());
    mockedSave.mockResolvedValueOnce(undefined);
    fireEvent.press(screen.getByTestId('animal-cell-eagle'));
    await waitFor(() => expect(mockedSave).toHaveBeenCalledTimes(2));
    expect(screen.queryByTestId('avatar-picker-save-error')).toBeNull();
  });

  it('logs the underlying error to console.warn when save fails', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const boom = new Error('boom');
    mockedSave.mockRejectedValueOnce(boom);
    render(<AvatarPickerModal {...baseProps} visible onClose={jest.fn()} />);
    fireEvent.press(screen.getByTestId('animal-cell-bear'));
    await waitFor(() => expect(screen.getByTestId('avatar-picker-save-error')).toBeTruthy());
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('AvatarPickerModal'), boom);
    warnSpy.mockRestore();
  });

  it('clears a stale save error when the modal is hidden and reopened', async () => {
    mockedSave.mockRejectedValueOnce(new Error('boom'));
    const { rerender } = render(
      <AvatarPickerModal {...baseProps} visible onClose={jest.fn()} />,
    );
    fireEvent.press(screen.getByTestId('animal-cell-bear'));
    await waitFor(() => expect(screen.getByTestId('avatar-picker-save-error')).toBeTruthy());

    rerender(
      <ThemeProvider>
        <AvatarPickerModal {...baseProps} visible={false} onClose={jest.fn()} />
      </ThemeProvider>,
    );
    rerender(
      <ThemeProvider>
        <AvatarPickerModal {...baseProps} visible onClose={jest.fn()} />
      </ThemeProvider>,
    );

    expect(screen.queryByTestId('avatar-picker-save-error')).toBeNull();
  });
});
