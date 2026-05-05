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

export const yomoyoTypography = {
  titleSize: 28,
  titleWeight: '700' as const,
  bodySize: 18,
  bodyLineHeight: 26,
  bodyWeight: '400' as const,
  buttonSize: 18,
  buttonWeight: '600' as const,
  secondaryActionSize: 17,
  secondaryActionWeight: '500' as const,
  subtitleSize: 18,
  subtitleWeight: '400' as const,
  errorSize: 14,
  screenTitleSize: 24,
  screenBodySize: 16,
  screenBodyLineHeight: 24,
  headerTitleSize: 18,
} as const;

export const yomoyoSpacing = {
  horizontalPadding: 32,
  buttonHeight: 56,
  buttonRadius: 14,
} as const;
