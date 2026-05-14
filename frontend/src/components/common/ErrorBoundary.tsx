import React, { Component, ErrorInfo, ReactNode } from 'react';
import * as Sentry from "@sentry/react";
import i18next from 'i18next';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const t = i18next.t.bind(i18next);

      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--theme-surface)] px-4">
          <div className="max-w-md w-full bg-[var(--theme-surface)] rounded-lg shadow-lg p-8 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
              {t('common.somethingWentWrong', 'Oops! Something went wrong')}
            </h1>
            <p className="text-[var(--journal-text-muted)] mb-6">
              {t('common.errorRefresh', "We're sorry for the inconvenience. Please try refreshing the page.")}
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre className="text-left text-xs bg-[var(--theme-surface)] p-4 rounded mb-4 overflow-auto">
                {this.state.error.toString()}
              </pre>
            )}
            <div className="flex gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {t('common.retry', 'Try Again')}
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-2 bg-[var(--theme-surface)] text-[var(--foreground)] rounded-lg hover:opacity-90 transition"
              >
                {t('common.goHome', 'Go Home')}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
