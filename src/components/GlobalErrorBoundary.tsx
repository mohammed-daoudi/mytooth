'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  errorId?: string;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  level?: 'page' | 'component' | 'global';
}

interface ErrorFallbackProps {
  error: Error;
  errorInfo?: React.ErrorInfo;
  resetError: () => void;
  errorId?: string;
  level?: 'page' | 'component' | 'global';
}

// Default error fallback component
function DefaultErrorFallback({ error, resetError, errorId, level = 'component' }: ErrorFallbackProps) {
  const isGlobal = level === 'global';
  const isPage = level === 'page';

  return (
    <div className={`flex items-center justify-center ${isGlobal ? 'min-h-screen' : 'min-h-[400px]'} p-4`}>
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {isGlobal ? 'Application Error' : isPage ? 'Page Error' : 'Something went wrong'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <Bug className="h-4 w-4" />
            <AlertTitle>Error Details</AlertTitle>
            <AlertDescription className="mt-2">
              <details className="whitespace-pre-wrap">
                <summary className="cursor-pointer hover:underline">
                  {error.message || 'An unexpected error occurred'}
                </summary>
                {process.env.NODE_ENV === 'development' && (
                  <pre className="mt-2 text-xs opacity-70 overflow-auto">
                    {error.stack}
                  </pre>
                )}
              </details>
            </AlertDescription>
          </Alert>

          {errorId && (
            <p className="text-sm text-muted-foreground">
              Error ID: <code className="bg-muted px-1 py-0.5 rounded">{errorId}</code>
            </p>
          )}

          <div className="flex gap-2 flex-wrap">
            <Button onClick={resetError} variant="default" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>

            {isGlobal && (
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            )}

            {process.env.NODE_ENV === 'development' && (
              <Button
                onClick={() => {
                  console.error('Error Boundary triggered:', error);
                  console.error('Error Info:', error.stack);
                }}
                variant="outline"
                size="sm"
              >
                Log to Console
              </Button>
            )}
          </div>

          {isGlobal && (
            <div className="text-sm text-muted-foreground border-t pt-4">
              <p>If this problem persists, please:</p>
              <ul className="list-disc ml-4 mt-1 space-y-1">
                <li>Refresh the page</li>
                <li>Clear your browser cache</li>
                <li>Contact support if the issue continues</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Generate a unique error ID
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Update state with error info
    this.setState({
      errorInfo
    });

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught an Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }

    // Log error to external service in production
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      window.clearTimeout(this.resetTimeoutId);
    }
  }

  private logErrorToService = (error: Error, errorInfo: React.ErrorInfo) => {
    // In a real app, you would send this to your error tracking service
    // like Sentry, LogRocket, or Bugsnag
    try {
      const errorData = {
        errorId: this.state.errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        level: this.props.level || 'component'
      };

      // Example: Send to your error tracking endpoint
      // fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorData)
      // });

      console.warn('Error logged:', errorData);
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  };

  private resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined, errorId: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;

      return (
        <FallbackComponent
          error={this.state.error!}
          errorInfo={this.state.errorInfo}
          resetError={this.resetError}
          errorId={this.state.errorId}
          level={this.props.level}
        />
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easy wrapping
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// Hook for programmatic error throwing
export function useErrorHandler() {
  return React.useCallback((error: Error) => {
    throw error;
  }, []);
}

export default ErrorBoundary;
