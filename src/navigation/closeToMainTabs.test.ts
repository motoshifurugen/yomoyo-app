import { CommonActions } from '@react-navigation/native';
import { closeToMainTabs } from './closeToMainTabs';

describe('closeToMainTabs', () => {
  it('sets the main tab then dismisses the overlay with goBack', () => {
    const goBack = jest.fn();
    const dispatch = jest.fn();
    const navigation = {
      goBack,
      dispatch,
      getState: () => ({
        index: 1,
        routes: [
          { name: 'MainTabs', key: 'main-tabs-key' },
          { name: 'UserProfile', key: 'profile-key' },
        ],
      }),
    } as never;

    closeToMainTabs(navigation, 'Timeline');

    expect(dispatch).toHaveBeenCalledWith({
      ...CommonActions.setParams({ screen: 'Timeline' }),
      source: 'main-tabs-key',
    });
    expect(goBack).toHaveBeenCalledTimes(1);
  });

  it('resets the stack when MainTabs is not in the history', () => {
    const goBack = jest.fn();
    const dispatch = jest.fn();
    const navigation = {
      goBack,
      dispatch,
      getState: () => ({
        index: 0,
        routes: [{ name: 'UserProfile', key: 'profile-key' }],
      }),
    } as never;

    closeToMainTabs(navigation);

    expect(goBack).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'MainTabs', params: { screen: 'Timeline' } }],
      }),
    );
  });
});
