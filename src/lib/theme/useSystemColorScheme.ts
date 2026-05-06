import { useColorScheme } from 'react-native';
import type { SystemScheme } from './resolveThemeMode';

export function useSystemColorScheme(): SystemScheme {
  return useColorScheme();
}
