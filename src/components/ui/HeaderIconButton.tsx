import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={styles.iconButton}
      hitSlop={8}
    >
      <Ionicons name={iconName} size={size} color={color ?? colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
