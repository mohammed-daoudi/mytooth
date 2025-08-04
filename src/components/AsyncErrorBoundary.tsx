'use client';

import React from 'react';
import { Wifi, WifiOff, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ErrorBoundary from './GlobalErrorBoundary';

interface AsyncErrorBoundaryState {
  hasAsyncError: boolean;
  asyncError?: string;
  isRetrying: boolean;
  retryCount: number;
  isOnline: boolean;
}

interface AsyncErrorBoundaryProps {
  children: React.ReactNode;
  onRetry?: () => void | Promise<void>;
  maxRetries?: number;
  showNetworkStatus?: boolean;
}

export class AsyncErrorBoundary extends React.Component<AsyncErrorBoundaryProps, AsyncErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;
  private maxRetries: number;

  constructor(props: AsyncErrorBoundaryProps) {
    super(props);
    this.maxRetries = props.maxRetries ?? 3;
    this.state = {
      hasAsyncError: false,
      isRetrying: false,
      retryCount: 0,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true
    };
  }

  componentDidMount() {
    // Listen for online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);

      // Listen for unhandled promise rejections
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
    }
  }

  componentWillUnmount() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
      window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
    }

    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private handleOnline = () => {
    this.setState({ isOnline: true });

    // Auto-retry if we were offline and had an error
    if (this.state.hasAsyncError && this.state.retryCount < this.maxRetries) {
      this.handleRetry();
    }
  };

  private handleOffline = () => {
    this.setState({ isOnline: false });
  };

  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    // Only handle network/API related errors
    const error = event.reason;
    if (this.isNetworkError(error) || this.isAPIError(error)) {
      event.preventDefault(); // Prevent default browser error handling
      this.setAsyncError(this.getErrorMessage(error));
    }
  };

  private isNetworkError = (error: any): boolean => {
    return (
      error instanceof TypeError &&
      (error.message.includes('fetch') || error.message.includes('network'))
    ) ||
    error?.code === 'NETWORK_ERROR' ||
    error?.name === 'NetworkError';
  };

  private isAPIError = (error: any): boolean => {
    return (
      error?.response?.status >= 400 ||
      error?.status >= 400 ||
      error?.code === 'API_ERROR'
    );
  };

  private getErrorMessage = (error: any): string => {
    if (!this.state.isOnline) {
      return 'You appear to be offline. Please check your internet connection.';
    }

    if (this.isNetworkError(error)) {
      return 'Network connection failed. Please check your internet connection and try again.';
    }

    if (this.isAPIError(error)) {
      const status = error?.response?.status || error?.status;
      switch (status) {
        case 401:
          return 'Your session has expired. Please log in again.';
        case 403:
          return 'You do not have permission to perform this action.';
        case 404:
          return 'The requested resource was not found.';
        case 429:
          return 'Too many requests. Please wait a moment and try again.';
        case 500:
          return 'Server error. Please try again later.';
        case 503:
          return 'Service temporarily unavailable. Please try again later.';
        default:
          return error?.message || 'An error occurred while loading data.';
      }
    }

    return error?.message || 'An unexpected error occurred.';
  };

  public setAsyncError = (error: string) => {
    this.setState({
      hasAsyncError: true,
      asyncError: error,
      isRetrying: false
    });
  };

  private handleRetry = async () => {
    if (this.state.retryCount >= this.maxRetries) {
      return;
    }

    this.setState({ isRetrying: true });

    try {
      if (this.props.onRetry) {
        await this.props.onRetry();
      }

      // If retry succeeds, clear the error
      this.setState({
        hasAsyncError: false,
        asyncError: undefined,
        isRetrying: false,
        retryCount: 0
      });
    } catch (error) {
      const newRetryCount = this.state.retryCount + 1;
      const shouldAutoRetry = newRetryCount < this.maxRetries && this.isNetworkError(error);

      this.setState({
        asyncError: this.getErrorMessage(error),
        isRetrying: false,
        retryCount: newRetryCount
      });

      // Auto-retry network errors with exponential backoff
      if (shouldAutoRetry) {
        const delay = Math.min(1000 * Math.pow(2, newRetryCount), 10000); // Max 10 seconds
        this.retryTimeoutId = setTimeout(() => {
          this.handleRetry();
        }, delay);
      }
    }
  };

  private resetError = () => {
    this.setState({
      hasAsyncError: false,
      asyncError: undefined,
      retryCount: 0,
      isRetrying: false
    });
  };

  render() {
    const { children, showNetworkStatus = true } = this.props;
    const { hasAsyncError, asyncError, isRetrying, retryCount, isOnline } = this.state;

    return (
      <ErrorBoundary level="component">
        {showNetworkStatus && !isOnline && (
          <Alert variant="destructive" className="mb-4">
            <WifiOff className="h-4 w-4" />
            <AlertTitle>No Internet Connection</AlertTitle>
            <AlertDescription>
              You are currently offline. Some features may not be available.
            </AlertDescription>
          </Alert>
        )}

        {hasAsyncError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription className="space-y-3">
              <p>{asyncError}</p>

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  onClick={this.handleRetry}
                  disabled={isRetrying || retryCount >= this.maxRetries}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
                  {isRetrying ? 'Retrying...' : 'Retry'}
                </Button>

                {retryCount >= this.maxRetries && (
                  <Button
                    onClick={this.resetError}
                    size="sm"
                    variant="secondary"
                  >
                    Dismiss
                  </Button>
                )}

                {!isOnline && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <WifiOff className="h-3 w-3" />
                    Offline
                  </div>
                )}
              </div>

              {retryCount > 0 && (
                <p className="text-sm text-muted-foreground">
                  Retry attempts: {retryCount}/{this.maxRetries}
                </p>
              )}
            </AlertDescription>
          </Alert>
        )}

        {children}
      </ErrorBoundary>
    );
  }
}

// Hook to use the async error boundary
export function useAsyncErrorHandler() {
  const errorBoundaryRef = React.useRef<AsyncErrorBoundary>(null);

  const handleAsyncError = React.useCallback((error: any) => {
    if (errorBoundaryRef.current) {
      const errorMessage = errorBoundaryRef.current['getErrorMessage'](error);
      errorBoundaryRef.current.setAsyncError(errorMessage);
    }
  }, []);

  return { handleAsyncError, errorBoundaryRef };
}

export default AsyncErrorBoundary;
