/**
 * End-to-End Workflow Tests
 */

import { test, describe, expect, beforeEach } from 'bun:test';
import { apiClient } from '../src/lib/apiClient';

// Import test setup
import './setup';

// Mock fetch responses for workflow testing
const mockFetch = (url: string | URL, init?: RequestInit): Promise<Response> => {
  const urlString = url.toString();
  const headers = init?.headers as Record<string, string> || {};
  const authHeader = headers['Authorization'] || '';
  const body = init?.body ? JSON.parse(init.body as string) : {};

  // Create a proper Response-like object
  const createResponse = (data: any, status = 200): Response => {
    const response = new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });
    return response;
  };

  // Authentication endpoints
  if (urlString.includes('/api/auth/login')) {
    if (body.email === 'test@example.com' && body.password === 'password') {
      return Promise.resolve(createResponse({
        accessToken: 'valid-token',
        user: { id: 'test-user', email: 'test@example.com', role: 'USER', name: 'Test User' }
      }));
    }
    return Promise.resolve(createResponse({ error: 'Invalid credentials' }, 401));
  }

  if (urlString.includes('/api/auth/verify')) {
    if (authHeader.includes('valid-token')) {
      return Promise.resolve(createResponse({
        user: { id: 'test-user', email: 'test@example.com', role: 'USER', name: 'Test User' }
      }));
    }
    return Promise.resolve(createResponse({ error: 'Invalid token' }, 401));
  }

  if (urlString.includes('/api/auth/refresh')) {
    if (authHeader.includes('valid-token')) {
      return Promise.resolve(createResponse({ accessToken: 'new-valid-token' }));
    }
    return Promise.resolve(createResponse({ error: 'Invalid refresh token' }, 401));
  }

  // Booking endpoints
  if (urlString.includes('/api/bookings') && init?.method === 'POST') {
    if (authHeader.includes('valid-token')) {
      return Promise.resolve(createResponse({
        id: 'booking-123',
        ...body,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      }, 201));
    }
    return Promise.resolve(createResponse({ error: 'Unauthorized' }, 401));
  }

  if (urlString.includes('/api/bookings')) {
    if (authHeader.includes('valid-token')) {
      return Promise.resolve(createResponse([
        {
          id: 'booking-123',
          patientId: 'test-user',
          dentistId: 'dentist-1',
          serviceId: 'service-1',
          status: 'PENDING',
          startsAt: new Date().toISOString()
        }
      ]));
    }
    return Promise.resolve(createResponse({ error: 'Unauthorized' }, 401));
  }

  // Services endpoints
  if (urlString.includes('/api/services')) {
    return Promise.resolve(createResponse([
      { id: 'service-1', name: 'Cleaning', price: 100, duration: 30 },
      { id: 'service-2', name: 'Filling', price: 200, duration: 60 }
    ]));
  }

  // Dentists endpoints
  if (urlString.includes('/api/dentists')) {
    return Promise.resolve(createResponse([
      { id: 'dentist-1', name: 'Dr. Smith', specialization: 'General Dentistry' },
      { id: 'dentist-2', name: 'Dr. Johnson', specialization: 'Orthodontics' }
    ]));
  }

  // Default 404 response
  return Promise.resolve(createResponse({ error: 'Not Found' }, 404));
};

// Replace global fetch with our mock
globalThis.fetch = mockFetch as any;

describe('Booking Workflow Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('User Authentication Flow', () => {
    test('should handle complete login flow', async () => {
      // Test login
      const loginResponse = await apiClient.post('/api/auth/login', {
        email: 'test@example.com',
        password: 'password'
      }, { requireAuth: false });

      expect(loginResponse.success).toBe(true);
      expect(loginResponse.data.accessToken).toBe('valid-token');
      expect(loginResponse.data.user.email).toBe('test@example.com');

      // Store token as if user logged in
      localStorage.setItem('auth-token', loginResponse.data.accessToken);

      // Test token verification
      const verifyResponse = await apiClient.get('/api/auth/verify');
      expect(verifyResponse.success).toBe(true);
      expect(verifyResponse.data.user.email).toBe('test@example.com');
    });

    test('should handle login failure', async () => {
      const loginResponse = await apiClient.post('/api/auth/login', {
        email: 'wrong@example.com',
        password: 'wrongpassword'
      }, { requireAuth: false });

      expect(loginResponse.success).toBe(false);
      expect(loginResponse.status).toBe(401);
      expect(loginResponse.error).toBe('Invalid credentials');
    });

    test('should handle token refresh', async () => {
      // Set up initial token
      localStorage.setItem('auth-token', 'valid-token');

      const refreshResponse = await apiClient.post('/api/auth/refresh', {}, { skipRefreshQueue: true });
      expect(refreshResponse.success).toBe(true);
      expect(refreshResponse.data.accessToken).toBe('new-valid-token');
    });
  });

  describe('Booking Creation Flow', () => {
    beforeEach(() => {
      // Set up authenticated state
      localStorage.setItem('auth-token', 'valid-token');
    });

    test('should fetch available services', async () => {
      const servicesResponse = await apiClient.get('/api/services', { requireAuth: false });

      expect(servicesResponse.success).toBe(true);
      expect(Array.isArray(servicesResponse.data)).toBe(true);
      expect(servicesResponse.data.length).toBeGreaterThan(0);
      expect(servicesResponse.data[0]).toHaveProperty('name');
      expect(servicesResponse.data[0]).toHaveProperty('price');
    });

    test('should fetch available dentists', async () => {
      const dentistsResponse = await apiClient.get('/api/dentists', { requireAuth: false });

      expect(dentistsResponse.success).toBe(true);
      expect(Array.isArray(dentistsResponse.data)).toBe(true);
      expect(dentistsResponse.data.length).toBeGreaterThan(0);
      expect(dentistsResponse.data[0]).toHaveProperty('name');
      expect(dentistsResponse.data[0]).toHaveProperty('specialization');
    });

    test('should create booking successfully', async () => {
      const bookingData = {
        dentistId: 'dentist-1',
        serviceId: 'service-1',
        startsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        notes: 'Test booking'
      };

      const bookingResponse = await apiClient.post('/api/bookings', bookingData);

      expect(bookingResponse.success).toBe(true);
      expect(bookingResponse.status).toBe(201);
      expect(bookingResponse.data.id).toBe('booking-123');
      expect(bookingResponse.data.status).toBe('PENDING');
      expect(bookingResponse.data.dentistId).toBe(bookingData.dentistId);
    });

    test('should require authentication for booking', async () => {
      // Remove auth token
      localStorage.removeItem('auth-token');

      const bookingData = {
        dentistId: 'dentist-1',
        serviceId: 'service-1',
        startsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      const bookingResponse = await apiClient.post('/api/bookings', bookingData);

      expect(bookingResponse.success).toBe(false);
      expect(bookingResponse.status).toBe(401);
    });
  });

  describe('User Dashboard Flow', () => {
    beforeEach(() => {
      localStorage.setItem('auth-token', 'valid-token');
    });

    test('should fetch user bookings', async () => {
      const bookingsResponse = await apiClient.get('/api/bookings');

      expect(bookingsResponse.success).toBe(true);
      expect(Array.isArray(bookingsResponse.data)).toBe(true);

      if (bookingsResponse.data.length > 0) {
        const booking = bookingsResponse.data[0];
        expect(booking).toHaveProperty('id');
        expect(booking).toHaveProperty('status');
        expect(booking).toHaveProperty('startsAt');
      }
    });

    test('should handle empty bookings list', async () => {
      // Mock empty response
      const originalFetch = globalThis.fetch;
      (globalThis.fetch as any) = (url: string | URL, init?: RequestInit) => {
        if (url.toString().includes('/api/bookings')) {
          return Promise.resolve(new Response('[]', {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }));
        }
        return originalFetch(url, init);
      };

      const bookingsResponse = await apiClient.get('/api/bookings');

      expect(bookingsResponse.success).toBe(true);
      expect(bookingsResponse.data).toEqual([]);

      // Restore original fetch
      globalThis.fetch = originalFetch;
    });
  });

  describe('Error Handling and Recovery', () => {
    test('should handle network errors gracefully', async () => {
      // Mock network error
      const originalFetch = globalThis.fetch;
      (globalThis.fetch as any) = () => {
        throw new Error('Network error');
      };

      const response = await apiClient.get('/api/services', { requireAuth: false });

      expect(response.success).toBe(false);
      expect(response.error).toBe('Network error');

      // Restore original fetch
      globalThis.fetch = originalFetch;
    });

    test('should handle server errors', async () => {
      // Mock server error
      const originalFetch = globalThis.fetch;
      (globalThis.fetch as any) = () => {
        return Promise.resolve(new Response(JSON.stringify({ error: 'Internal Server Error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }));
      };

      const response = await apiClient.get('/api/services', { requireAuth: false });

      expect(response.success).toBe(false);
      expect(response.status).toBe(500);

      // Restore original fetch
      globalThis.fetch = originalFetch;
    });

    test('should retry failed requests', async () => {
      let attemptCount = 0;
      const originalFetch = globalThis.fetch;

      (globalThis.fetch as any) = (url: string | URL, init?: RequestInit) => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('Network error');
        }
        return originalFetch(url, init);
      };

      const response = await apiClient.get('/api/services', { requireAuth: false });

      expect(attemptCount).toBeGreaterThan(1); // Should have retried
      expect(response.success).toBe(true);

      // Restore original fetch
      globalThis.fetch = originalFetch;
    });
  });

  describe('Complete User Journey', () => {
    test('should complete full booking journey', async () => {
      // 1. Login
      const loginResponse = await apiClient.post('/api/auth/login', {
        email: 'test@example.com',
        password: 'password'
      }, { requireAuth: false });

      expect(loginResponse.success).toBe(true);
      localStorage.setItem('auth-token', loginResponse.data.accessToken);

      // 2. Fetch services
      const servicesResponse = await apiClient.get('/api/services', { requireAuth: false });
      expect(servicesResponse.success).toBe(true);

      // 3. Fetch dentists
      const dentistsResponse = await apiClient.get('/api/dentists', { requireAuth: false });
      expect(dentistsResponse.success).toBe(true);

      // 4. Create booking
      const bookingResponse = await apiClient.post('/api/bookings', {
        dentistId: dentistsResponse.data[0].id,
        serviceId: servicesResponse.data[0].id,
        startsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });

      expect(bookingResponse.success).toBe(true);
      expect(bookingResponse.status).toBe(201);

      // 5. Verify booking appears in user's bookings
      const userBookingsResponse = await apiClient.get('/api/bookings');
      expect(userBookingsResponse.success).toBe(true);
      expect(userBookingsResponse.data.length).toBeGreaterThan(0);
    });
  });
});
