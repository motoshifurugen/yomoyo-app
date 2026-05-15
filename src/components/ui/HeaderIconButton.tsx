import React from 'react';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PressableSurface from './PressableSurface';
import { useTheme } from '@/lib/theme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

type Props = {
  iconName: IoniconName;
  onPress: () => void;
  accessibilityLabel: string;
  testID?: string;
  color?: string;
  size?: number;
};

export default function HeaderIconButton({
  iconName,
  onPress,
  accessibilityLabel,
  testID,
  color,
  size = 22,
}: Props) {
  const { colors } = useTheme();
  return (
    <PressableSurface
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={styles.iconButton}
      hitSlop={8}
      feedback="standard"
    >
      <Ionicons name={iconName} size={size} color={color ?? colors.text} />
    </PressableSurface>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
