import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './ui/Button';

/**
 * Props for the ErrorBoundary component.
 */
interface ErrorBoundaryProps {
  /** Child components to wrap */
  children: ReactNode;
  /** Optional fallback UI to show when an error occurs */
  fallback?: ReactNode;
  /** Callback when an error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Whether to show a minimal error UI (for nested boundaries) */
  minimal?: boolean;
}

/**
 * State for the ErrorBoundary component.
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component that catches JavaScript errors in child components.
 * Displays a fallback UI instead of crashing the entire application.
 *
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 *
 * // With custom fallback
 * <ErrorBoundary fallback={<CustomErrorUI />}>
 *   <MyComponent />
 * </ErrorBoundary>
 *
 * // With error callback for logging
 * <ErrorBoundary onError={(error) => logToService(error)}>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Call the optional error callback
    this.props.onError?.(error, errorInfo);

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback, minimal } = this.props;

    if (hasError) {
      // If a custom fallback is provided, use it
      if (fallback) {
        return fallback;
      }

      // Minimal error UI for nested boundaries
      if (minimal) {
        return (
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Something went wrong</span>
            </div>
            <button
              onClick={this.handleReset}
              className="mt-2 text-xs text-red-600 dark:text-red-400 hover:underline"
            >
              Try again
            </button>
          </div>
        );
      }

      // Full error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center">
            {/* Error Icon */}
            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>

            {/* Error Message */}
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We encountered an unexpected error. Please try again or reload the page.
            </p>

            {/* Error Details (Development Only) */}
            {import.meta.env.DEV && error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                  Error details
                </summary>
                <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs text-red-600 dark:text-red-400 overflow-auto max-h-40">
                  {error.message}
                  {'\n\n'}
                  {error.stack}
                </pre>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-3">
              <Button variant="secondary" onClick={this.handleReset}>
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
              <Button variant="primary" onClick={this.handleReload}>
                <Home className="w-4 h-4" />
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

/**
 * Higher-order component to wrap a component with an error boundary.
 *
 * @example
 * ```tsx
 * const SafeComponent = withErrorBoundary(MyComponent);
 * ```
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const ComponentWithErrorBoundary = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;

  return ComponentWithErrorBoundary;
}

/**
 * Hook to programmatically trigger an error (useful for testing).
 * Note: This must be used within an ErrorBoundary.
 */
export function useErrorHandler() {
  return (error: Error) => {
    throw error;
  };
}
