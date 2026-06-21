import React from 'react';
import { act, screen, fireEvent } from '@testing-library/react-native';
import { renderWithTheme as render } from '@/lib/theme/testUtils';
import BarcodeScanScreen from './BarcodeScanScreen';
import { useCameraPermissions } from 'expo-camera';
import { lookupByIsbn } from '@/lib/books/openBD';

const mockReplace = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ replace: mockReplace, goBack: mockGoBack }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/lib/books/openBD', () => {
  const actual = jest.requireActual('@/lib/books/openBD');
  return {
    ...actual,
    lookupByIsbn: jest.fn(),
  };
});

const VALID_ISBN = '9784101001456';
const VALID_ISBN_2 = '9784062748689';
const INVALID_ISBN = '4901234567894';
const sampleBook = {
  id: `isbn:${VALID_ISBN}`,
  title: 'ノルウェイの森',
  authors: ['村上 春樹／著'],
  thumbnail: null,
};

function setPermission(granted: boolean) {
  jest.mocked(useCameraPermissions).mockReturnValue([
    { status: granted ? 'granted' : 'denied', granted, canAskAgain: false, expires: 'never', accessPrivileges: 'all' } as any,
    jest.fn().mockResolvedValue({
      status: granted ? 'granted' : 'denied',
      granted,
    } as any),
    jest.fn().mockResolvedValue({
      status: granted ? 'granted' : 'denied',
      granted,
    } as any),
  ] as any);
}

function fireScan(data: string) {
  const camera = screen.getByTestId('barcode-camera');
  act(() => {
    camera.props.onBarcodeScanned?.({ data, type: 'ean13' });
  });
}

describe('BarcodeScanScreen', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockGoBack.mockClear();
    jest.mocked(lookupByIsbn).mockReset();
    jest.mocked(useCameraPermissions).mockReset();
    setPermission(true);
  });

  it('renders the camera view when permission is granted', () => {
    render(<BarcodeScanScreen />);
    expect(screen.getByTestId('barcode-camera')).toBeTruthy();
  });

  it('shows the calm permission-denied state with a search-by-title button', () => {
    setPermission(false);
    render(<BarcodeScanScreen />);
    expect(screen.getByText('bookScan.permissionTitle')).toBeTruthy();
    expect(screen.getByText('bookScan.permissionBody')).toBeTruthy();

    fireEvent.press(screen.getByRole('button', { name: 'bookScan.searchByTitle' }));
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('looks up the ISBN and replaces to BookDetail on a successful match', async () => {
    jest.mocked(lookupByIsbn).mockResolvedValue(sampleBook);
    render(<BarcodeScanScreen />);

    fireScan(VALID_ISBN);

    await screen.findByText('bookScan.looking');
    expect(jest.mocked(lookupByIsbn)).toHaveBeenCalledWith(VALID_ISBN);
    await act(async () => {});
    expect(mockReplace).toHaveBeenCalledWith('BookDetail', { book: sampleBook });
  });

  it('shows the calm not-found state when openBD returns no match', async () => {
    jest.mocked(lookupByIsbn).mockResolvedValue(null);
    render(<BarcodeScanScreen />);

    fireScan(VALID_ISBN);

    expect(await screen.findByText('bookScan.notFound')).toBeTruthy();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('shows the lookup-error state when openBD fails', async () => {
    jest.mocked(lookupByIsbn).mockRejectedValue(new Error('openBD error: 500'));
    render(<BarcodeScanScreen />);

    fireScan(VALID_ISBN);

    expect(await screen.findByText('bookScan.lookupError')).toBeTruthy();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('ignores non-ISBN-13 barcodes silently and keeps scanning', () => {
    render(<BarcodeScanScreen />);
    fireScan(INVALID_ISBN);
    expect(jest.mocked(lookupByIsbn)).not.toHaveBeenCalled();
  });

  it('does not start a second lookup while one is in flight', () => {
    jest
      .mocked(lookupByIsbn)
      .mockImplementation(() => new Promise(() => { /* never resolves */ }));
    render(<BarcodeScanScreen />);

    fireScan(VALID_ISBN);
    fireScan(VALID_ISBN_2);
    fireScan(VALID_ISBN);

    expect(jest.mocked(lookupByIsbn)).toHaveBeenCalledTimes(1);
  });

  it('resumes scanning after pressing Try again from the not-found state', async () => {
    jest.mocked(lookupByIsbn).mockResolvedValueOnce(null);
    render(<BarcodeScanScreen />);

    fireScan(VALID_ISBN);
    await screen.findByText('bookScan.notFound');

    fireEvent.press(screen.getByRole('button', { name: 'bookScan.tryAgain' }));

    jest.mocked(lookupByIsbn).mockResolvedValueOnce(sampleBook);
    fireScan(VALID_ISBN);
    await act(async () => {});
    expect(mockReplace).toHaveBeenCalledWith('BookDetail', { book: sampleBook });
  });

  it('exposes a search-by-title button from the not-found state', async () => {
    jest.mocked(lookupByIsbn).mockResolvedValue(null);
    render(<BarcodeScanScreen />);

    fireScan(VALID_ISBN);
    await screen.findByText('bookScan.notFound');

    fireEvent.press(screen.getByRole('button', { name: 'bookScan.searchByTitle' }));
    expect(mockGoBack).toHaveBeenCalled();
  });
});
