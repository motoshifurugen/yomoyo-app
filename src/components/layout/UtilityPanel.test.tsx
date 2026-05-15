import React from 'react';
import { Text } from 'react-native';
import { screen, fireEvent } from '@testing-library/react-native';
import { renderWithTheme as render } from '@/lib/theme/testUtils';
import UtilityPanel from './UtilityPanel';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe('UtilityPanel — visibility', () => {
  it('does not render children when not visible', () => {
    render(
      <UtilityPanel visible={false} onClose={jest.fn()}>
        <Text>panel-body</Text>
      </UtilityPanel>,
    );
    expect(screen.queryByText('panel-body')).toBeNull();
  });

  it('renders children when visible', () => {
    render(
      <UtilityPanel visible={true} onClose={jest.fn()}>
        <Text>panel-body</Text>
      </UtilityPanel>,
    );
    expect(screen.getByText('panel-body')).toBeTruthy();
  });

  it('renders the backdrop when visible', () => {
    render(
      <UtilityPanel visible={true} onClose={jest.fn()}>
        <Text>panel-body</Text>
      </UtilityPanel>,
    );
    expect(screen.getByTestId('utility-panel-backdrop')).toBeTruthy();
  });

  it('renders the close button when visible', () => {
    render(
      <UtilityPanel visible={true} onClose={jest.fn()}>
        <Text>panel-body</Text>
      </UtilityPanel>,
    );
    expect(screen.getByTestId('utility-panel-close')).toBeTruthy();
  });
});

describe('UtilityPanel — dismissal', () => {
  it('calls onClose when the backdrop is pressed', () => {
    const onClose = jest.fn();
    render(
      <UtilityPanel visible={true} onClose={onClose}>
        <Text>panel-body</Text>
      </UtilityPanel>,
    );
    fireEvent.press(screen.getByTestId('utility-panel-backdrop'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the close button is pressed', () => {
    const onClose = jest.fn();
    render(
      <UtilityPanel visible={true} onClose={onClose}>
        <Text>panel-body</Text>
      </UtilityPanel>,
    );
    fireEvent.press(screen.getByTestId('utility-panel-close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when the panel content is pressed', () => {
    const onClose = jest.fn();
    render(
      <UtilityPanel visible={true} onClose={onClose}>
        <Text>panel-body</Text>
      </UtilityPanel>,
    );
    fireEvent.press(screen.getByTestId('utility-panel-content'));
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe('UtilityPanel — accessibility', () => {
  it('exposes the close button as a button with an accessible label', () => {
    render(
      <UtilityPanel visible={true} onClose={jest.fn()}>
        <Text>panel-body</Text>
      </UtilityPanel>,
    );
    const closeButton = screen.getByTestId('utility-panel-close');
    expect(closeButton.props.accessibilityRole).toBe('button');
    expect(closeButton.props.accessibilityLabel).toBe('menu.close');
  });
});
