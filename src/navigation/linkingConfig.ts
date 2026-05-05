import type { LinkingOptions } from '@react-navigation/native';

export const linkingConfig: LinkingOptions<object> = {
  prefixes: ['yomoyo://'],
  config: {
    screens: {
      App: {
        screens: {
          UserProfile: 'user/:uid',
        },
      },
    },
  },
};
