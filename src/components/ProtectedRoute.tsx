"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import {
  Shield,
  Lock,
  AlertTriangle,
  User,
  LogIn,
  ArrowLeft,
  Clock
} from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'dentist' | 'patient' | string[];
  fallbackComponent?: React.ReactNode;
  showLoader?: boolean;
  redirectTo?: string;
}

interface AccessControlProps {
  allowedRoles?: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showError?: boolean;
}

// Loading component
const AuthLoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center space-y-6"
    >
      <div className="w-16 h-16 mx-auto border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-slate-900">Verifying Access...</h3>
        <p className="text-slate-600">Please wait while we check your credentials</p>
      </div>
    </motion.div>
  </div>
);

// Unauthorized access component
const UnauthorizedAccess = ({
  requiredRole,
  userRole,
  onGoBack,
  onLogin
}: {
  requiredRole?: string | string[];
  userRole?: string;
  onGoBack: () => void;
  onLogin: () => void;
}) => (
  <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-md w-full"
    >
      <Card className="border-0 shadow-xl">
        <CardContent className="p-8 text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
            <Shield className="h-10 w-10 text-white" />
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-slate-900">Access Restricted</h2>
            <p className="text-slate-600">
              {!userRole ? (
                "You need to be logged in to access this page."
              ) : (
                `This page requires ${Array.isArray(requiredRole) ? requiredRole.join(' or ') : requiredRole} access. Your current role: ${userRole}.`
              )}
            </p>
          </div>

          <Alert className="border-amber-200 bg-amber-50 text-amber-800">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              If you believe this is an error, please contact your administrator.
            </AlertDescription>
          </Alert>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={onGoBack}
              variant="outline"
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            {!userRole && (
              <Button
                onClick={onLogin}
                className="flex-1 dental-gradient"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  </div>
);

// Session expired component
const SessionExpired = ({ onLogin }: { onLogin: () => void }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 flex items-center justify-center p-4">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-md w-full"
    >
      <Card className="border-0 shadow-xl">
        <CardContent className="p-8 text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-slate-500 to-slate-600 rounded-full flex items-center justify-center">
            <Clock className="h-10 w-10 text-white" />
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-slate-900">Session Expired</h2>
            <p className="text-slate-600">
              Your session has expired for security reasons. Please log in again to continue.
            </p>
          </div>

          <Button
            onClick={onLogin}
            className="w-full dental-gradient"
            size="lg"
          >
            <LogIn className="mr-2 h-5 w-5" />
            Login Again
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  </div>
);

// Main ProtectedRoute component
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  fallbackComponent,
  showLoader = true,
  redirectTo
}) => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    console.log('🛡️ [PROTECTED_ROUTE] Auth state changed:', {
      isAuthenticated,
      isLoading,
      userEmail: user?.email,
      userRole: user?.role,
      pathname,
      requiredRole
    });
  }, [isAuthenticated, isLoading, user, pathname, requiredRole]);

  useEffect(() => {
    // Check if user was previously authenticated but token expired
    const wasAuthenticated = localStorage.getItem('wasAuthenticated');
    if (wasAuthenticated && !isAuthenticated && !isLoading) {
      console.log('🛡️ [PROTECTED_ROUTE] Session expired detected');
      setSessionExpired(true);
      localStorage.removeItem('wasAuthenticated');
    }
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    if (isAuthenticated) {
      console.log('🛡️ [PROTECTED_ROUTE] Setting wasAuthenticated flag');
      localStorage.setItem('wasAuthenticated', 'true');
    }
  }, [isAuthenticated]);

  const hasRequiredRole = (userRole: string, required?: string | string[]): boolean => {
    if (!required) return true;

    if (Array.isArray(required)) {
      return required.includes(userRole);
    }

    return userRole === required;
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const handleLogin = () => {
    const loginUrl = redirectTo || `/auth/login?redirect=${encodeURIComponent(pathname)}`;
    console.log('🛡️ [PROTECTED_ROUTE] Redirecting to login:', loginUrl);
    router.push(loginUrl);
  };

  // Show loading screen while checking authentication
  if (isLoading && showLoader) {
    console.log('🛡️ [PROTECTED_ROUTE] Showing loading screen');
    return <AuthLoadingScreen />;
  }

  // Show session expired screen
  if (sessionExpired) {
    console.log('🛡️ [PROTECTED_ROUTE] Showing session expired screen');
    return <SessionExpired onLogin={handleLogin} />;
  }

  // If middleware passed the user through, but client-side auth isn't ready yet,
  // give it a bit more time before showing unauthorized
  if (!isAuthenticated && !isLoading) {
    // If we're not loading and not authenticated, show unauthorized
    console.log('🛡️ [PROTECTED_ROUTE] User not authenticated, showing unauthorized access');
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }
    return (
      <UnauthorizedAccess
        requiredRole={requiredRole}
        onGoBack={handleGoBack}
        onLogin={handleLogin}
      />
    );
  }

  // Check role authorization
  if (requiredRole && user && !hasRequiredRole(user.role, requiredRole)) {
    console.log('🛡️ [PROTECTED_ROUTE] User role insufficient:', {
      userRole: user.role,
      requiredRole
    });
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }
    return (
      <UnauthorizedAccess
        requiredRole={requiredRole}
        userRole={user.role}
        onGoBack={handleGoBack}
        onLogin={handleLogin}
      />
    );
  }

  console.log('🛡️ [PROTECTED_ROUTE] Access granted, rendering children');
  return <>{children}</>;
};

// Access control component for conditional rendering
export const AccessControl: React.FC<AccessControlProps> = ({
  allowedRoles,
  children,
  fallback,
  showError = false
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    if (showError) {
      return (
        <Alert variant="destructive" className="my-4">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            You must be logged in to access this feature.
          </AlertDescription>
        </Alert>
      );
    }
    return fallback ? <>{fallback}</> : null;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    if (showError) {
      return (
        <Alert variant="destructive" className="my-4">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access this feature.
          </AlertDescription>
        </Alert>
      );
    }
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};

// Role-based conditional component
export const RoleGuard = ({
  roles,
  children,
  fallback
}: {
  roles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user || !roles.includes(user.role)) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};

// Higher-order component for protecting pages
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<ProtectedRouteProps, 'children'>
) => {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
};

export default ProtectedRoute;
