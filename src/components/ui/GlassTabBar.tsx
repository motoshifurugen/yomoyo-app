import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { CommonActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GlassSurface from './GlassSurface';
import { yomoyoColors, yomoyoGlass } from '@/constants/yomoyoTheme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, { active: IoniconName; inactive: IoniconName }> = {
  Feed: { active: 'book', inactive: 'book-outline' },
  Friends: { active: 'people', inactive: 'people-outline' },
  Shelf: { active: 'library', inactive: 'library-outline' },
  Settings: { active: 'settings', inactive: 'settings-outline' },
};

const FALLBACK_ICONS: { active: IoniconName; inactive: IoniconName } = {
  active: 'ellipse',
  inactive: 'ellipse-outline',
};

export const GLASS_TAB_BAR_HEIGHT = 64;
export const GLASS_TAB_BAR_BOTTOM_OFFSET = 12;

export function useGlassTabBarInset(): number {
  const insets = useSafeAreaInsets();
  return GLASS_TAB_BAR_HEIGHT + GLASS_TAB_BAR_BOTTOM_OFFSET + insets.bottom;
}

export default function GlassTabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  const bottomOffset = (insets?.bottom ?? 0) + GLASS_TAB_BAR_BOTTOM_OFFSET;

  return (
    <View style={[styles.container, { bottom: bottomOffset }]}>
      <View style={styles.shadow}>
        <GlassSurface borderRadius={30} style={styles.pill}>
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const options = descriptors[route.key].options;
            const label = options.title ?? route.name;
            const icons = TAB_ICONS[route.name] ?? FALLBACK_ICONS;
            const iconName = focused ? icons.active : icons.inactive;
            const color = focused ? yomoyoColors.primary : yomoyoColors.muted;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.dispatch(CommonActions.navigate(route.name));
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                style={styles.tab}
                onPress={onPress}
                accessibilityRole="tab"
                accessibilityLabel={label}
                accessibilityState={{ selected: focused }}
              >
                <Ionicons name={iconName} size={22} color={color} />
                <Text style={[styles.label, { color }]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </GlassSurface>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: GLASS_TAB_BAR_HEIGHT,
  },
  shadow: {
    flex: 1,
    borderRadius: 30,
    backgroundColor: yomoyoColors.surface,
    ...Platform.select({
      ios: {
        shadowColor: yomoyoGlass.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 1,
        shadowRadius: 24,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
  },
});
