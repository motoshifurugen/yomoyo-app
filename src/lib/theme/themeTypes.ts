import type { lightColors, lightGlass } from '@/constants/yomoyoTheme';

// Widens an `as const` palette so its values are typed as `string`
// rather than each specific hex/rgba literal. Without this, the dark
// palette is rejected as not assignable to the light palette's type.
type WidenStrings<T> = { [K in keyof T]: T[K] extends string ? string : T[K] };

export type ThemeColors = WidenStrings<typeof lightColors>;
export type ThemeGlass = WidenStrings<typeof lightGlass>;
