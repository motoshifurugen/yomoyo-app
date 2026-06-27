import { dismissRootModal } from './dismissRootModal';

describe('dismissRootModal', () => {
  it('goes back on the parent navigator when available', () => {
    const parentGoBack = jest.fn();
    const parentCanGoBack = jest.fn(() => true);
    const navigation = {
      getParent: () => ({ goBack: parentGoBack, canGoBack: parentCanGoBack }),
    } as never;

    dismissRootModal(navigation);

    expect(parentGoBack).toHaveBeenCalledTimes(1);
  });

  it('does nothing when the parent cannot go back', () => {
    const parentGoBack = jest.fn();
    const navigation = {
      getParent: () => ({ goBack: parentGoBack, canGoBack: () => false }),
    } as never;

    dismissRootModal(navigation);

    expect(parentGoBack).not.toHaveBeenCalled();
  });
});
