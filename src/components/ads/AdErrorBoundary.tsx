import React from 'react';

type Props = { children: React.ReactNode };
type State = { hasError: boolean };

export default class AdErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(err: unknown): void {
    const e = err as { message?: string };
    console.error('[AdErrorBoundary] render failed —', e?.message ?? err);
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
