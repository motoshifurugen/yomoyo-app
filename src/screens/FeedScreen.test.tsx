import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import FeedScreen from './FeedScreen';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate }),
}));

describe('FeedScreen', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders the Feed title', () => {
    render(<FeedScreen />);
    expect(screen.getByText('Feed')).toBeTruthy();
  });

  it('shows a button to navigate to Book Detail', () => {
    render(<FeedScreen />);
    expect(screen.getByText('Go to Book Detail')).toBeTruthy();
  });

  it('navigates to BookDetail when the button is pressed', () => {
    render(<FeedScreen />);
    fireEvent.press(screen.getByText('Go to Book Detail'));
    expect(mockNavigate).toHaveBeenCalledWith('BookDetail');
  });

  it('the Book Detail button has an accessible button role', () => {
    render(<FeedScreen />);
    expect(screen.getByRole('button', { name: 'Go to Book Detail' })).toBeTruthy();
  });
});
