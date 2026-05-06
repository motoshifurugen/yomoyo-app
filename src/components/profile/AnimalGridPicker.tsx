import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ANIMAL_POOL, ANIMAL_ASSETS } from '@/lib/users/avatarIdentity';
import type { AnimalKey } from '@/lib/users/avatarIdentity';
import { useThemedStyles, type ThemeColors } from '@/lib/theme';

type Props = {
  selected: AnimalKey;
  onSelect: (key: AnimalKey) => void;
};

export default function AnimalGridPicker({ selected, onSelect }: Props) {
  const { t } = useTranslation();
  const styles = useThemedStyles(makeStyles);
  return (
    <View testID="animal-grid-picker" style={styles.grid}>
      {ANIMAL_POOL.map((key) => {
        const isSelected = key === selected;
        return (
          <TouchableOpacity
            key={key}
            testID={`animal-cell-${key}`}
            style={[styles.cell, isSelected && styles.cellSelected]}
            onPress={() => onSelect(key)}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={t(`profile.animals.${key}`)}
          >
            <Image source={ANIMAL_ASSETS[key]} style={styles.image} resizeMode="contain" />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const CELL_GAP = 8;

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      rowGap: CELL_GAP,
    },
    cell: {
      width: '23%',
      aspectRatio: 1,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: 'transparent',
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cellSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.selectedBackground,
    },
    image: {
      width: '70%',
      height: '70%',
    },
  });
