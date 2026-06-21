// Ambient shim so the project type-checks before `expo-tracking-transparency`
// is installed in this sandbox. Mirrors the package's public API.
//
// After running `pnpm install` (which installs the real package with its own
// types), delete this file if you hit duplicate-declaration errors.
declare module 'expo-tracking-transparency' {
  export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

  export interface PermissionResponse {
    status: PermissionStatus;
    granted: boolean;
    canAskAgain: boolean;
    expires: 'never' | number;
  }

  export function requestTrackingPermissionsAsync(): Promise<PermissionResponse>;
  export function getTrackingPermissionsAsync(): Promise<PermissionResponse>;
}
