import { yomoyoColors, yomoyoTypography, yomoyoSpacing } from './yomoyoTheme';

describe('yomoyoColors', () => {
  it('has the correct background color', () => {
    expect(yomoyoColors.background).toBe('#F4F8FA');
  });

  it('has the correct primary (teal) color', () => {
    expect(yomoyoColors.primary).toBe('#057373');
  });

  it('has the correct text color', () => {
    expect(yomoyoColors.text).toBe('#111827');
  });

  it('has the correct secondaryText color', () => {
    expect(yomoyoColors.secondaryText).toBe('#5F6F6F');
  });

  it('has the correct surface color', () => {
    expect(yomoyoColors.surface).toBe('#FFFFFF');
  });

  it('has the correct border color', () => {
    expect(yomoyoColors.border).toBe('#D8E1E4');
  });

  it('has the correct muted color', () => {
    expect(yomoyoColors.muted).toBe('#8A989C');
  });

  it('has the correct error color', () => {
    expect(yomoyoColors.error).toBe('#d32f2f');
  });

  it('has the correct googleButtonBorder color', () => {
    expect(yomoyoColors.googleButtonBorder).toBe('#E2DED6');
  });

  it('has the correct selectedBackground color', () => {
    expect(yomoyoColors.selectedBackground).toBe('#EAF6F6');
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
