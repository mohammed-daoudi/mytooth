// © 2025 Mohammed DAOUDI - My Tooth. All rights reserved.
"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { TokenPayload } from '@/lib/auth';
import { apiClient } from '@/lib/apiClient';

interface User extends TokenPayload {
  name?: string;
  phone?: string;
  profileImage?: string;
  address?: string;
  dateOfBirth?: string;
  emergencyContact?: string;
  medicalHistory?: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, userData: User) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshToken: () => Promise<boolean>;
  isAuthenticated: boolean;
  hasRole: (role: string | string[]) => boolean;
  tokenExpiresIn: number | null; // Time in milliseconds until token expires
  isTokenNearExpiry: boolean; // If token expires within 10 minutes
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tokenExpiresIn, setTokenExpiresIn] = useState<number | null>(null);
  const [isTokenNearExpiry, setIsTokenNearExpiry] = useState(false);

  // Enhanced token monitoring
  const updateTokenStatus = useCallback(async () => {
    const timeUntilExpiration = await apiClient.getTimeUntilExpiration();
    setTokenExpiresIn(timeUntilExpiration);
    setIsTokenNearExpiry(timeUntilExpiration !== null && timeUntilExpiration <= 10 * 60 * 1000); // 10 minutes
  }, []);

  useEffect(() => {
    // Check for stored auth token on mount
    const checkAuth = async () => {
      try {
        console.log('🔍 [AUTH_PROVIDER] Checking authentication...');
        const storedToken = localStorage.getItem('auth-token');

        if (storedToken) {
          console.log('📝 [AUTH_PROVIDER] Found token in localStorage, verifying...');

          // Check if token is valid before making API call
          const isValid = await apiClient.isTokenValid();
          if (!isValid) {
            console.log('❌ [AUTH_PROVIDER] Token expired in localStorage, removing...');
            localStorage.removeItem('auth-token');
            document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/; samesite=strict';
            setUser(null);
            setToken(null);
            setIsLoading(false);
            return;
          }

          // Verify token with backend
          const response = await apiClient.get('/api/auth/verify', { requireAuth: true });

          console.log('🔐 [AUTH_PROVIDER] Verification response status:', response.status);

          if (response.success && response.data?.user) {
            console.log('✅ [AUTH_PROVIDER] Token verified, user data:', response.data.user);
            setUser(response.data.user);
            setToken(storedToken);
            await updateTokenStatus();
          } else {
            console.log('❌ [AUTH_PROVIDER] Token verification failed, removing token');
            localStorage.removeItem('auth-token');
            // Clear invalid cookie
            document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/; samesite=strict';
            setUser(null);
            setToken(null);
          }
        } else {
          console.log('📝 [AUTH_PROVIDER] No token found in localStorage');
        }
      } catch (error) {
        console.error('🚨 [AUTH_PROVIDER] Auth check failed:', error);
        localStorage.removeItem('auth-token');
        // Clear invalid cookie
        document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/; samesite=strict';
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
        console.log('🏁 [AUTH_PROVIDER] Auth check completed, isAuthenticated:', !!user);
      }
    };

    checkAuth();
  }, [updateTokenStatus]);

  // Enhanced token monitoring with proactive refresh and status updates
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (user && token) {
      // Update token status every 30 seconds
      intervalId = setInterval(async () => {
        try {
          await updateTokenStatus();

          const storedToken = localStorage.getItem('auth-token');
          if (!storedToken) {
            console.log('❌ [AUTH_PROVIDER] No token found during periodic check');
            logout();
            return;
          }

          // Check token validity
          const isValid = await apiClient.isTokenValid();
          if (!isValid) {
            console.log('🔄 [AUTH_PROVIDER] Token invalid during periodic check, attempting refresh...');
            const refreshSuccess = await refreshToken();
            if (!refreshSuccess) {
              console.log('❌ [AUTH_PROVIDER] Token refresh failed during periodic check, logging out');
              logout();
            }
          } else {
            console.log('✅ [AUTH_PROVIDER] Token still valid during periodic check');
          }
        } catch (error) {
          console.error('🚨 [AUTH_PROVIDER] Periodic token validation failed:', error);
          logout();
        }
      }, 30 * 1000); // 30 seconds - aligned with API client monitoring
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [user, token, updateTokenStatus]);

  const login = async (authToken: string, userData: User): Promise<void> => {
    console.log('🔑 [AUTH_PROVIDER] Logging in user:', userData.email);

    // Store token in both localStorage and cookie for middleware compatibility
    localStorage.setItem('auth-token', authToken);

    // Set cookie for middleware (expires in 7 days to match JWT expiration)
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);
    const isSecure = window.location.protocol === 'https:';
    document.cookie = `auth-token=${authToken}; expires=${expires.toUTCString()}; path=/; samesite=strict${isSecure ? '; secure' : ''}`;

    // Update user state immediately
    setUser(userData);
    setToken(authToken);

    // Update token status
    await updateTokenStatus();

    console.log('✅ [AUTH_PROVIDER] Login completed');

    // Return a promise that resolves when the state is updated
    return new Promise<void>((resolve) => {
      // Use a longer timeout to ensure all state updates are complete
      setTimeout(() => {
        console.log('🔄 [AUTH_PROVIDER] Auth state updated, user:', userData.email, 'role:', userData.role);
        resolve();
      }, 150);
    });
  };

  const logout = useCallback(() => {
    console.log('🚪 [AUTH_PROVIDER] Logging out user');

    // Clear the API client request queue
    apiClient.clearQueue();

    // Clear both localStorage and cookie
    localStorage.removeItem('auth-token');
    localStorage.removeItem('wasAuthenticated');

    // Clear auth cookie
    document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/; samesite=strict';

    setUser(null);
    setToken(null);
    setTokenExpiresIn(null);
    setIsTokenNearExpiry(false);

    // Redirect to home page
    window.location.href = '/';
  }, []);

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      console.log('🔄 Attempting to refresh token via AuthProvider...');

      // Use the enhanced API client refresh mechanism
      const success = await apiClient.forceRefresh();

      if (success) {
        // Update local token state
        const newToken = localStorage.getItem('auth-token');
        if (newToken) {
          setToken(newToken);
          await updateTokenStatus();
          console.log('✅ Token refreshed successfully via AuthProvider');
        }
      }

      return success;
    } catch (error) {
      console.error('🚨 Token refresh error in AuthProvider:', error);
      return false;
    }
  };

  const isAuthenticated = !!user;

  const hasRole = (role: string | string[]): boolean => {
    if (!user) return false;

    if (Array.isArray(role)) {
      return role.includes(user.role);
    }

    return user.role === role;
  };

  // Handle token expiration warnings
  useEffect(() => {
    if (isTokenNearExpiry && user) {
      console.log('⚠️ Token nearing expiration, will refresh proactively');
      // The API client will handle proactive refresh automatically
    }
  }, [isTokenNearExpiry, user]);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    logout,
    updateUser,
    refreshToken,
    isAuthenticated,
    hasRole,
    tokenExpiresIn,
    isTokenNearExpiry,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
