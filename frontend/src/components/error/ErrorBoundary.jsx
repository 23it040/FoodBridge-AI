import React from 'react';
import ErrorState from '../ui/ErrorState';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log to console for now
    // In production, send to logging endpoint
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught an error', error, info);
    this.setState({ info });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, info: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isDev = Boolean(typeof import.meta !== 'undefined' && import.meta.env?.DEV);
      const errorMessage =
        this.state.error?.message ||
        (typeof this.state.error === 'string' ? this.state.error : 'An unexpected error occurred.');

      return (
        <div className="py-12 px-4">
          <ErrorState
            title="Something went wrong"
            description={isDev ? errorMessage : 'An unexpected error occurred.'}
            action={(
              <div className="flex items-center justify-center gap-3">
                <button onClick={this.handleRetry} className="rounded-full bg-[#047857] px-4 py-2 text-white text-xs font-bold hover:bg-[#065F46] transition">Retry</button>
                <button onClick={() => window.location.reload()} className="rounded-full border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition">Reload</button>
              </div>
            )}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
