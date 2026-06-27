import { CommonActions } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from './types';

/** Dismiss a modal overlay downward and show the chosen main tab underneath. */
export function closeToMainTabs(
  navigation: NavigationProp<RootStackParamList>,
  screen: 'Timeline' | 'Shelf' = 'Timeline',
) {
  const state = navigation.getState();
  const mainTabsIndex = state.routes.findIndex((route) => route.name === 'MainTabs');

  if (mainTabsIndex >= 0 && state.index > mainTabsIndex) {
    const mainTabsKey = state.routes[mainTabsIndex].key;
    navigation.dispatch({
      ...CommonActions.setParams({ screen }),
      source: mainTabsKey,
    });
    navigation.goBack();
    return;
  }

  navigation.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'MainTabs', params: { screen } }],
    }),
  );
}
