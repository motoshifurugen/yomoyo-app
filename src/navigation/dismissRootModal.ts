import type { NavigationProp, ParamListBase } from '@react-navigation/native';

/** Dismiss the outermost modal overlay (e.g. AddFriendFlow) with the native modal animation. */
export function dismissRootModal(navigation: NavigationProp<ParamListBase>) {
  const parent = navigation.getParent();
  if (parent?.canGoBack()) {
    parent.goBack();
  }
}
