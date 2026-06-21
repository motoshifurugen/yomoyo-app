export const lightColors = {
  background: '#F4F8FA',
  primary: '#057373',
  text: '#111827',
  secondaryText: '#5F6F6F',
  surface: '#FFFFFF',
  border: '#D8E1E4',
  muted: '#8A989C',
  error: '#d32f2f',
  googleButtonBorder: '#E2DED6',
  selectedBackground: '#EAF6F6',
} as const;

// Warm, low-stimulation dark palette: keeps the teal identity while
// staying calm and readable at night.
export const darkColors = {
  background: '#0E1517',
  primary: '#3FB5B5',
  text: '#ECE7DD',
  secondaryText: '#A6AFAE',
  surface: '#162226',
  border: '#243033',
  muted: '#6E7A7C',
  error: '#F47B7B',
  googleButtonBorder: '#3A3530',
  selectedBackground: '#13302F',
} as const;

export const lightGlass = {
  background: 'rgba(255, 255, 255, 0.72)',
  strongBackground: 'rgba(255, 255, 255, 0.86)',
  border: 'rgba(216, 225, 228, 0.72)',
  shadow: 'rgba(17, 24, 39, 0.08)',
  tealTint: 'rgba(5, 115, 115, 0.10)',
} as const;

export const darkGlass = {
  background: 'rgba(22, 34, 38, 0.72)',
  strongBackground: 'rgba(22, 34, 38, 0.86)',
  border: 'rgba(36, 48, 51, 0.72)',
  shadow: 'rgba(0, 0, 0, 0.40)',
  tealTint: 'rgba(63, 181, 181, 0.16)',
} as const;

export const yomoyoColors = lightColors;
export const yomoyoGlass = lightGlass;

// --- Shared baseline (#109) ---
// A single source of truth for spacing and type so every screen can lay out
// on the same rhythm. Semantic tokens below (yomoyoTypography / yomoyoSpacing)
// derive from these primitives instead of repeating magic numbers.

// 4pt-based spacing scale. Use these steps for padding, margins, and gaps so
// whitespace stays consistent and "breathes" the same across screens.
export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

// Type scale primitives. Semantic typography tokens map onto these sizes.
export const fontSize = {
  caption: 14,
  body: 16,
  bodyLg: 18,
  title: 24,
  display: 28,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const lineHeight = {
  body: 24,
  bodyLg: 26,
} as const;

export const yomoyoTypography = {
  titleSize: fontSize.display,
  titleWeight: fontWeight.bold,
  bodySize: fontSize.bodyLg,
  bodyLineHeight: lineHeight.bodyLg,
  bodyWeight: fontWeight.regular,
  buttonSize: fontSize.bodyLg,
  buttonWeight: fontWeight.semibold,
  secondaryActionSize: 17,
  secondaryActionWeight: fontWeight.medium,
  subtitleSize: fontSize.bodyLg,
  subtitleWeight: fontWeight.regular,
  errorSize: fontSize.caption,
  screenTitleSize: fontSize.title,
  screenBodySize: fontSize.body,
  screenBodyLineHeight: lineHeight.body,
  headerTitleSize: fontSize.bodyLg,
} as const;

export const yomoyoSpacing = {
  horizontalPadding: spacing.xxl,
  buttonHeight: 56,
  buttonRadius: 14,
} as const;
