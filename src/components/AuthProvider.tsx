"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { TokenPayload } from '@/lib/auth';

interface User extends TokenPayload {
  name?: string;
  phone?: string;
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isAuthenticated: boolean;
  hasRole: (role: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth token on mount
    const checkAuth = async () => {
      try {
        console.log('🔍 Checking authentication...');
        const token = localStorage.getItem('auth-token');
        
        if (token) {
          console.log('📝 Found token in localStorage, verifying...');
          
          // Verify token with backend
          const response = await fetch('/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          console.log('🔐 Verification response status:', response.status);

          if (response.ok) {
            const userData = await response.json();
            console.log('✅ Token verified, user data:', userData.user);
            setUser(userData.user);
          } else {
            console.log('❌ Token verification failed, removing token');
            localStorage.removeItem('auth-token');
            setUser(null);
          }
        } else {
          console.log('📝 No token found in localStorage');
        }
      } catch (error) {
        console.error('🚨 Auth check failed:', error);
        localStorage.removeItem('auth-token');
        setUser(null);
      } finally {
        setIsLoading(false);
        console.log('🏁 Auth check completed');
      }
    };

    checkAuth();
  }, []);

  const login = async (token: string, userData: User) => {
    console.log('🔑 Logging in user:', userData.email);
    localStorage.setItem('auth-token', token);
    setUser(userData);
    console.log('✅ Login completed');
    
    // Return a promise that resolves when the state is updated
    return new Promise<void>((resolve) => {
      // Use setTimeout to ensure state update is processed
      setTimeout(() => {
        console.log('🔄 Auth state updated, user:', userData.email);
        resolve();
      }, 50);
    });
  };

  const logout = () => {
    console.log('🚪 Logging out user');
    localStorage.removeItem('auth-token');
    setUser(null);
    // Redirect to home page
    window.location.href = '/';
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
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

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    updateUser,
    isAuthenticated,
    hasRole,
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
