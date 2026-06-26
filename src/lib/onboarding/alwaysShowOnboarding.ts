/** Dev verification: replay onboarding on every sign-in / app start. */
export const alwaysShowOnboarding =
  process.env.EXPO_PUBLIC_ALWAYS_SHOW_ONBOARDING === 'true';
