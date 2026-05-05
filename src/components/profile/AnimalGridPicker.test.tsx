import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import AnimalGridPicker from './AnimalGridPicker';
import { ANIMAL_POOL } from '@/lib/users/avatarIdentity';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('AnimalGridPicker', () => {
  it('renders a cell for every key in ANIMAL_POOL', () => {
    render(<AnimalGridPicker selected="fox" onSelect={() => {}} />);
    for (const key of ANIMAL_POOL) {
      expect(screen.getByTestId(`animal-cell-${key}`)).toBeTruthy();
    }
  });

  it('marks the selected cell with accessibilityState selected=true', () => {
    render(<AnimalGridPicker selected="bear" onSelect={() => {}} />);
    const selectedCell = screen.getByTestId('animal-cell-bear');
    expect(selectedCell.props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );
  });

  it('marks unselected cells with accessibilityState selected=false', () => {
    render(<AnimalGridPicker selected="bear" onSelect={() => {}} />);
    const unselectedCell = screen.getByTestId('animal-cell-fox');
    expect(unselectedCell.props.accessibilityState).toEqual(
      expect.objectContaining({ selected: false }),
    );
  });

  it('invokes onSelect with the cell key when pressed', () => {
    const onSelect = jest.fn();
    render(<AnimalGridPicker selected="fox" onSelect={onSelect} />);
    fireEvent.press(screen.getByTestId('animal-cell-wolf'));
    expect(onSelect).toHaveBeenCalledWith('wolf');
  });

  it('exposes a stable testID for the picker root', () => {
    render(<AnimalGridPicker selected="fox" onSelect={() => {}} />);
    expect(screen.getByTestId('animal-grid-picker')).toBeTruthy();
  });

  it('uses a translated accessibilityLabel per cell instead of the raw key', () => {
    render(<AnimalGridPicker selected="fox" onSelect={() => {}} />);
    const cell = screen.getByTestId('animal-cell-raccoon_dog');
    expect(cell.props.accessibilityLabel).toBe('profile.animals.raccoon_dog');
    expect(cell.props.accessibilityLabel).not.toBe('raccoon_dog');
  });
});
