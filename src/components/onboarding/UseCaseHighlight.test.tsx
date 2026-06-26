import React from 'react';
import { screen } from '@testing-library/react-native';
import { renderWithTheme as render } from '@/lib/theme/testUtils';
import UseCaseHighlight from './UseCaseHighlight';

describe('UseCaseHighlight', () => {
  it('renders the label', () => {
    render(<UseCaseHighlight icon="book-outline" label="Record the books you finish" />);
    expect(screen.getByText('Record the books you finish')).toBeTruthy();
  });

  it('applies the provided testID to the row', () => {
    render(
      <UseCaseHighlight icon="share-outline" label="Share your ID" testID="highlight-share" />,
    );
    expect(screen.getByTestId('highlight-share')).toBeTruthy();
  });
});
