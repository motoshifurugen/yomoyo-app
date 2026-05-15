import React from 'react';
import { Text } from 'react-native';
import { screen, fireEvent } from '@testing-library/react-native';
import { renderWithTheme as render } from '@/lib/theme/testUtils';
import PressableSurface from './PressableSurface';

function flattenStyle(raw: unknown): Record<string, unknown> {
  const flat = (Array.isArray(raw) ? raw : [raw]).filter(Boolean) as object[];
  return Object.assign({}, ...flat);
}

describe('PressableSurface', () => {
  it('renders children', () => {
    render(
      <PressableSurface onPress={jest.fn()} testID="surface">
        <Text>tap me</Text>
      </PressableSurface>,
    );
    expect(screen.getByText('tap me')).toBeTruthy();
  });

  it('renders with the provided testID', () => {
    render(
      <PressableSurface onPress={jest.fn()} testID="surface">
        <Text>tap me</Text>
      </PressableSurface>,
    );
    expect(screen.getByTestId('surface')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    render(
      <PressableSurface onPress={onPress} testID="surface">
        <Text>tap me</Text>
      </PressableSurface>,
    );
    fireEvent.press(screen.getByTestId('surface'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    render(
      <PressableSurface onPress={onPress} testID="surface" disabled>
        <Text>tap me</Text>
      </PressableSurface>,
    );
    fireEvent.press(screen.getByTestId('surface'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('forwards accessibilityRole', () => {
    render(
      <PressableSurface
        onPress={jest.fn()}
        testID="surface"
        accessibilityRole="button"
      >
        <Text>tap me</Text>
      </PressableSurface>,
    );
    expect(screen.getByTestId('surface').props.accessibilityRole).toBe('button');
  });

  it('forwards accessibilityLabel', () => {
    render(
      <PressableSurface
        onPress={jest.fn()}
        testID="surface"
        accessibilityLabel="Open"
      >
        <Text>tap me</Text>
      </PressableSurface>,
    );
    expect(screen.getByTestId('surface').props.accessibilityLabel).toBe('Open');
  });

  it('forwards accessibilityState', () => {
    render(
      <PressableSurface
        onPress={jest.fn()}
        testID="surface"
        accessibilityState={{ selected: true }}
      >
        <Text>tap me</Text>
      </PressableSurface>,
    );
    // Pressable merges disabled into accessibilityState — only assert the field we set.
    expect(screen.getByTestId('surface').props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );
  });

  it('forwards hitSlop', () => {
    render(
      <PressableSurface onPress={jest.fn()} testID="surface" hitSlop={12}>
        <Text>tap me</Text>
      </PressableSurface>,
    );
    expect(screen.getByTestId('surface').props.hitSlop).toBe(12);
  });

  it('merges the caller style with internal animated style', () => {
    render(
      <PressableSurface
        onPress={jest.fn()}
        testID="surface"
        style={{ paddingHorizontal: 12, paddingVertical: 8 }}
      >
        <Text>tap me</Text>
      </PressableSurface>,
    );
    const merged = flattenStyle(screen.getByTestId('surface').props.style);
    expect(merged).toEqual(
      expect.objectContaining({ paddingHorizontal: 12, paddingVertical: 8 }),
    );
  });

  it('defaults to "standard" feedback (includes a scale transform)', () => {
    render(
      <PressableSurface onPress={jest.fn()} testID="surface">
        <Text>tap me</Text>
      </PressableSurface>,
    );
    const merged = flattenStyle(screen.getByTestId('surface').props.style);
    expect(merged.transform).toBeDefined();
  });

  it('feedback="soft" applies no scale transform (cards / backdrops stay non-scaling)', () => {
    render(
      <PressableSurface onPress={jest.fn()} testID="surface" feedback="soft">
        <Text>tap me</Text>
      </PressableSurface>,
    );
    const merged = flattenStyle(screen.getByTestId('surface').props.style);
    expect(merged.transform).toBeUndefined();
  });

  it('feedback="standard" includes a scale transform', () => {
    render(
      <PressableSurface onPress={jest.fn()} testID="surface" feedback="standard">
        <Text>tap me</Text>
      </PressableSurface>,
    );
    const merged = flattenStyle(screen.getByTestId('surface').props.style);
    expect(merged.transform).toBeDefined();
  });

  it('feedback="confirming" includes a scale transform', () => {
    render(
      <PressableSurface onPress={jest.fn()} testID="surface" feedback="confirming">
        <Text>tap me</Text>
      </PressableSurface>,
    );
    const merged = flattenStyle(screen.getByTestId('surface').props.style);
    expect(merged.transform).toBeDefined();
  });

  it('exposes opacity in its animated style', () => {
    render(
      <PressableSurface onPress={jest.fn()} testID="surface">
        <Text>tap me</Text>
      </PressableSurface>,
    );
    const merged = flattenStyle(screen.getByTestId('surface').props.style);
    expect(merged.opacity).toBeDefined();
  });
});
