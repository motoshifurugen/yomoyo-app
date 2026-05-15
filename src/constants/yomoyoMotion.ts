export type FeedbackLevel = 'soft' | 'standard' | 'confirming';

export type FeedbackPreset = {
  pressedScale: number;
  pressedOpacity: number;
  pressInMs: number;
  pressOutMs: number;
};

export const MOTION_PRESETS: Readonly<Record<FeedbackLevel, FeedbackPreset>> = {
  soft: {
    pressedScale: 1,
    pressedOpacity: 0.85,
    pressInMs: 70,
    pressOutMs: 70,
  },
  standard: {
    pressedScale: 0.97,
    pressedOpacity: 0.92,
    pressInMs: 80,
    pressOutMs: 80,
  },
  confirming: {
    pressedScale: 0.95,
    pressedOpacity: 0.9,
    pressInMs: 90,
    pressOutMs: 90,
  },
} as const;
