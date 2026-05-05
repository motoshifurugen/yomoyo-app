import {
  yomoyoColors,
  yomoyoGlass,
  yomoyoTypography,
  yomoyoSpacing,
  lightColors,
  darkColors,
  lightGlass,
  darkGlass,
} from './yomoyoTheme';

const COLOR_KEYS = [
  'background',
  'primary',
  'text',
  'secondaryText',
  'surface',
  'border',
  'muted',
  'error',
  'googleButtonBorder',
  'selectedBackground',
] as const;

const GLASS_KEYS = ['background', 'strongBackground', 'border', 'shadow', 'tealTint'] as const;

function relativeLuminance(hex: string): number {
  const cleaned = hex.replace('#', '');
  const r = parseInt(cleaned.slice(0, 2), 16) / 255;
  const g = parseInt(cleaned.slice(2, 4), 16) / 255;
  const b = parseInt(cleaned.slice(4, 6), 16) / 255;
  const channel = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

describe('lightColors (brand identity, regression-locked)', () => {
  it('preserves the exact light palette values', () => {
    expect(lightColors).toEqual({
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
    });
  });
});

describe('darkColors', () => {
  it('exposes the same semantic keys as lightColors', () => {
    expect(Object.keys(darkColors).sort()).toEqual([...COLOR_KEYS].sort());
  });

  it('differs from lightColors on primary, background, surface, and text', () => {
    expect(darkColors.primary).not.toBe(lightColors.primary);
    expect(darkColors.background).not.toBe(lightColors.background);
    expect(darkColors.surface).not.toBe(lightColors.surface);
    expect(darkColors.text).not.toBe(lightColors.text);
  });

  it('uses a darker background than light mode', () => {
    expect(relativeLuminance(darkColors.background)).toBeLessThan(
      relativeLuminance(lightColors.background)
    );
  });

  it('uses lighter text than light mode (inverted contrast)', () => {
    expect(relativeLuminance(darkColors.text)).toBeGreaterThan(
      relativeLuminance(lightColors.text)
    );
  });

  it('keeps the brand teal family on primary (cyan-leaning hue, not red)', () => {
    expect(darkColors.primary).toMatch(/^#[0-9A-Fa-f]{6}$/);
    const hex = darkColors.primary.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    expect(g).toBeGreaterThanOrEqual(r);
    expect(b).toBeGreaterThanOrEqual(r);
    expect(g + b).toBeGreaterThan(r * 2);
  });
});

describe('lightGlass / darkGlass', () => {
  it('lightGlass exposes the documented glass keys', () => {
    expect(Object.keys(lightGlass).sort()).toEqual([...GLASS_KEYS].sort());
  });

  it('darkGlass exposes the same glass keys as lightGlass', () => {
    expect(Object.keys(darkGlass).sort()).toEqual([...GLASS_KEYS].sort());
  });

  it('lightGlass preserves the existing translucent values', () => {
    expect(lightGlass).toEqual({
      background: 'rgba(255, 255, 255, 0.72)',
      strongBackground: 'rgba(255, 255, 255, 0.86)',
      border: 'rgba(216, 225, 228, 0.72)',
      shadow: 'rgba(17, 24, 39, 0.08)',
      tealTint: 'rgba(5, 115, 115, 0.10)',
    });
  });

  it('darkGlass background is not white-based (must actually be a dark surface)', () => {
    expect(darkGlass.background).not.toEqual(lightGlass.background);
    expect(darkGlass.background.startsWith('rgba(255')).toBe(false);
  });
});

describe('back-compat re-exports', () => {
  it('yomoyoColors is the same reference as lightColors (back-compat shim, not a copy)', () => {
    expect(yomoyoColors).toBe(lightColors);
  });

  it('yomoyoGlass is the same reference as lightGlass (back-compat shim, not a copy)', () => {
    expect(yomoyoGlass).toBe(lightGlass);
  });
});

describe('yomoyoTypography', () => {
  it('has correct title font size', () => {
    expect(yomoyoTypography.titleSize).toBe(28);
  });

  it('has correct title font weight', () => {
    expect(yomoyoTypography.titleWeight).toBe('700');
  });

  it('has correct body font size', () => {
    expect(yomoyoTypography.bodySize).toBe(18);
  });

  it('has correct body line height', () => {
    expect(yomoyoTypography.bodyLineHeight).toBe(26);
  });

  it('has correct body font weight', () => {
    expect(yomoyoTypography.bodyWeight).toBe('400');
  });

  it('has correct button font size', () => {
    expect(yomoyoTypography.buttonSize).toBe(18);
  });

  it('has correct button font weight', () => {
    expect(yomoyoTypography.buttonWeight).toBe('600');
  });

  it('has correct secondaryAction font size', () => {
    expect(yomoyoTypography.secondaryActionSize).toBe(17);
  });

  it('has correct secondaryAction font weight', () => {
    expect(yomoyoTypography.secondaryActionWeight).toBe('500');
  });

  it('has correct error font size', () => {
    expect(yomoyoTypography.errorSize).toBe(14);
  });

  it('has correct screen title font size', () => {
    expect(yomoyoTypography.screenTitleSize).toBe(24);
  });

  it('has correct screen body font size', () => {
    expect(yomoyoTypography.screenBodySize).toBe(16);
  });

  it('has correct screen body line height', () => {
    expect(yomoyoTypography.screenBodyLineHeight).toBe(24);
  });

  it('has correct header title font size', () => {
    expect(yomoyoTypography.headerTitleSize).toBe(18);
  });
});

describe('yomoyoSpacing', () => {
  it('has correct horizontal padding', () => {
    expect(yomoyoSpacing.horizontalPadding).toBe(32);
  });

  it('has correct button height', () => {
    expect(yomoyoSpacing.buttonHeight).toBe(56);
  });

  it('has correct button border radius', () => {
    expect(yomoyoSpacing.buttonRadius).toBe(14);
  });
});
