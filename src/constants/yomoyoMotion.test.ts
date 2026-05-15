import { MOTION_PRESETS, type FeedbackLevel } from './yomoyoMotion';

const LEVELS: ReadonlyArray<FeedbackLevel> = ['soft', 'standard', 'confirming'];

describe('MOTION_PRESETS', () => {
  it('exposes exactly the three feedback levels', () => {
    expect(Object.keys(MOTION_PRESETS).sort()).toEqual([...LEVELS].sort());
  });

  it.each(LEVELS)('"%s" has all required fields', (level) => {
    const preset = MOTION_PRESETS[level];
    expect(preset).toEqual(
      expect.objectContaining({
        pressedScale: expect.any(Number),
        pressedOpacity: expect.any(Number),
        pressInMs: expect.any(Number),
        pressOutMs: expect.any(Number),
      }),
    );
  });

  it.each(LEVELS)('"%s" uses opacity strictly between 0.5 and 1', (level) => {
    const { pressedOpacity } = MOTION_PRESETS[level];
    expect(pressedOpacity).toBeGreaterThan(0.5);
    expect(pressedOpacity).toBeLessThan(1);
  });

  it.each(LEVELS)('"%s" keeps press-in under 200ms (calm, never sluggish)', (level) => {
    expect(MOTION_PRESETS[level].pressInMs).toBeGreaterThan(0);
    expect(MOTION_PRESETS[level].pressInMs).toBeLessThanOrEqual(200);
  });

  it.each(LEVELS)('"%s" press-out is at most press-in (snap back faster than press-in)', (level) => {
    const { pressInMs, pressOutMs } = MOTION_PRESETS[level];
    expect(pressOutMs).toBeGreaterThan(0);
    expect(pressOutMs).toBeLessThanOrEqual(pressInMs);
  });

  it('"soft" applies no scale (cards / list rows / modal backdrops remain non-scaling)', () => {
    expect(MOTION_PRESETS.soft.pressedScale).toBe(1);
  });

  it('"standard" applies subtle scale, between 0.95 and 0.99', () => {
    const { pressedScale } = MOTION_PRESETS.standard;
    expect(pressedScale).toBeGreaterThanOrEqual(0.95);
    expect(pressedScale).toBeLessThan(1);
  });

  it('"confirming" applies a slightly stronger scale than "standard"', () => {
    expect(MOTION_PRESETS.confirming.pressedScale).toBeLessThan(
      MOTION_PRESETS.standard.pressedScale,
    );
    expect(MOTION_PRESETS.confirming.pressedScale).toBeGreaterThanOrEqual(0.9);
  });
});
