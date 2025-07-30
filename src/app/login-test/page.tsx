"use client";

import React, { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LoginTestPage() {
  const { user, login, logout, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('admin@mytooth.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('🧪 [LOGIN_TEST] Attempting login with:', email);

      // Call the test login API
      const response = await fetch('/api/auth/test-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      console.log('✅ [LOGIN_TEST] Login API response:', data);

      // Use the real token and user data
      await login(data.token, data.user);
      console.log('🎉 [LOGIN_TEST] Login successful!');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      console.error('❌ [LOGIN_TEST] Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>🎉 Login Successful!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Role:</strong> {user?.role}</p>
              <p><strong>Name:</strong> {user?.name}</p>
            </div>

            <div className="space-y-2">
              <p><strong>Test Routes:</strong></p>
              <a href="/booking" className="block text-blue-600 hover:underline">
                🛒 Go to /booking
              </a>
              <a href="/profile" className="block text-blue-600 hover:underline">
                👤 Go to /profile
              </a>
              <a href="/admin" className="block text-blue-600 hover:underline">
                ⚙️ Go to /admin
              </a>
            </div>

            <Button onClick={logout} variant="outline" className="w-full">
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>🧪 Login Test Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Logging in...' : 'Test Login'}
          </Button>

          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Test Credentials:</strong></p>
            <p>Admin: admin@mytooth.com / admin123</p>
            <p>User: user@mytooth.com / user123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
