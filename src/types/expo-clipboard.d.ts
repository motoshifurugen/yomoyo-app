// Ambient shim so the project type-checks before `expo-clipboard`
// is installed in this sandbox. Mirrors the package's public API.
//
// After running `npx expo install expo-clipboard` (which installs the real
// package with its own types), delete this file if you hit
// duplicate-declaration errors.
declare module 'expo-clipboard' {
  export function setStringAsync(text: string): Promise<boolean>;
  export function getStringAsync(): Promise<string>;
}
