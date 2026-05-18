import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithTheme as render } from '@/lib/theme/testUtils';
import InlineDisplayNameEditor from './InlineDisplayNameEditor';
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
  initialDisplayName: 'Foxy',
  animalKey: 'fox' as const,
};

describe('InlineDisplayNameEditor', () => {
  it('renders the initial display name in the input', () => {
    render(<InlineDisplayNameEditor {...baseProps} onComplete={jest.fn()} onCancel={jest.fn()} />);
    const input = screen.getByTestId('display-name-input');
    expect(input.props.value).toBe('Foxy');
  });

  it('updates the input value as the user types', () => {
    render(<InlineDisplayNameEditor {...baseProps} onComplete={jest.fn()} onCancel={jest.fn()} />);
    fireEvent.changeText(screen.getByTestId('display-name-input'), 'Newname');
    expect(screen.getByTestId('display-name-input').props.value).toBe('Newname');
  });

  it('calls saveAvatarIdentity with the new name and current animalKey when save is pressed', async () => {
    render(<InlineDisplayNameEditor {...baseProps} onComplete={jest.fn()} onCancel={jest.fn()} />);
    fireEvent.changeText(screen.getByTestId('display-name-input'), 'Newname');
    fireEvent.press(screen.getByTestId('inline-name-save'));
    await waitFor(() => {
      expect(mockedSave).toHaveBeenCalledWith('user1', {
        animalKey: 'fox',
        displayName: 'Newname',
      });
    });
  });

  it('calls onComplete after a successful save', async () => {
    const onComplete = jest.fn();
    render(<InlineDisplayNameEditor {...baseProps} onComplete={onComplete} onCancel={jest.fn()} />);
    fireEvent.changeText(screen.getByTestId('display-name-input'), 'Newname');
    fireEvent.press(screen.getByTestId('inline-name-save'));
    await waitFor(() => expect(onComplete).toHaveBeenCalled());
  });

  it('disables the save button and shows error for empty input', () => {
    render(<InlineDisplayNameEditor {...baseProps} onComplete={jest.fn()} onCancel={jest.fn()} />);
    fireEvent.changeText(screen.getByTestId('display-name-input'), '');
    const saveButton = screen.getByTestId('inline-name-save');
    expect(saveButton.props.accessibilityState?.disabled).toBe(true);
    expect(screen.getByTestId('display-name-error')).toBeTruthy();
  });

  it('disables the save button and shows error for too-long input', () => {
    render(<InlineDisplayNameEditor {...baseProps} onComplete={jest.fn()} onCancel={jest.fn()} />);
    fireEvent.changeText(screen.getByTestId('display-name-input'), 'x'.repeat(25));
    const saveButton = screen.getByTestId('inline-name-save');
    expect(saveButton.props.accessibilityState?.disabled).toBe(true);
    expect(screen.getByTestId('display-name-error')).toBeTruthy();
  });

  it('does not call saveAvatarIdentity when save is pressed with invalid input', async () => {
    render(<InlineDisplayNameEditor {...baseProps} onComplete={jest.fn()} onCancel={jest.fn()} />);
    fireEvent.changeText(screen.getByTestId('display-name-input'), '');
    fireEvent.press(screen.getByTestId('inline-name-save'));
    await waitFor(() => expect(screen.getByTestId('display-name-error')).toBeTruthy());
    expect(mockedSave).not.toHaveBeenCalled();
  });

  it('calls onCancel without saving when cancel is pressed', () => {
    const onCancel = jest.fn();
    render(<InlineDisplayNameEditor {...baseProps} onComplete={jest.fn()} onCancel={onCancel} />);
    fireEvent.changeText(screen.getByTestId('display-name-input'), 'Edited');
    fireEvent.press(screen.getByTestId('inline-name-cancel'));
    expect(onCancel).toHaveBeenCalled();
    expect(mockedSave).not.toHaveBeenCalled();
  });

  it('shows a save error message and stays in edit mode when save rejects', async () => {
    mockedSave.mockRejectedValueOnce(new Error('boom'));
    const onComplete = jest.fn();
    render(<InlineDisplayNameEditor {...baseProps} onComplete={onComplete} onCancel={jest.fn()} />);
    fireEvent.changeText(screen.getByTestId('display-name-input'), 'Newname');
    fireEvent.press(screen.getByTestId('inline-name-save'));
    await waitFor(() => {
      expect(screen.getByTestId('inline-name-save-error')).toBeTruthy();
    });
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('re-enables the save button after a failed save so the user can retry', async () => {
    mockedSave.mockRejectedValueOnce(new Error('boom'));
    render(<InlineDisplayNameEditor {...baseProps} onComplete={jest.fn()} onCancel={jest.fn()} />);
    fireEvent.changeText(screen.getByTestId('display-name-input'), 'Newname');
    fireEvent.press(screen.getByTestId('inline-name-save'));
    await waitFor(() => expect(screen.getByTestId('inline-name-save-error')).toBeTruthy());
    const saveButton = screen.getByTestId('inline-name-save');
    expect(saveButton.props.accessibilityState?.disabled).toBe(false);
  });

  it('clears the save error when the user edits the input again', async () => {
    mockedSave.mockRejectedValueOnce(new Error('boom'));
    render(<InlineDisplayNameEditor {...baseProps} onComplete={jest.fn()} onCancel={jest.fn()} />);
    fireEvent.changeText(screen.getByTestId('display-name-input'), 'Newname');
    fireEvent.press(screen.getByTestId('inline-name-save'));
    await waitFor(() => expect(screen.getByTestId('inline-name-save-error')).toBeTruthy());
    fireEvent.changeText(screen.getByTestId('display-name-input'), 'Different');
    expect(screen.queryByTestId('inline-name-save-error')).toBeNull();
  });

  it('logs the underlying error to console.warn when save fails', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const boom = new Error('boom');
    mockedSave.mockRejectedValueOnce(boom);
    render(<InlineDisplayNameEditor {...baseProps} onComplete={jest.fn()} onCancel={jest.fn()} />);
    fireEvent.changeText(screen.getByTestId('display-name-input'), 'Newname');
    fireEvent.press(screen.getByTestId('inline-name-save'));
    await waitFor(() => expect(screen.getByTestId('inline-name-save-error')).toBeTruthy());
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('InlineDisplayNameEditor'), boom);
    warnSpy.mockRestore();
  });
});
