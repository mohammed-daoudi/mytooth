// Set environment variables before any imports
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes-only';
process.env.MONGODB_URI = 'mongodb://localhost:27017/mytooth_test';

import { beforeEach, afterEach } from 'bun:test';

// Global test utilities
declare global {
  var __TEST_DB_CONNECTION__: any;
  var __TEST_TIMERS__: {
    timeouts: Set<NodeJS.Timeout>;
    intervals: Set<NodeJS.Timeout>;
  };
}

beforeEach(() => {
  // Initialize test timer tracking
  globalThis.__TEST_TIMERS__ = {
    timeouts: new Set(),
    intervals: new Set(),
  };

  // Mock console methods to reduce noise during testing
  console.log = () => {};
  console.info = () => {};
  console.warn = () => {};
});

afterEach(() => {
  // Clean up timers
  if (globalThis.__TEST_TIMERS__) {
    globalThis.__TEST_TIMERS__.timeouts.forEach((timer) => {
      clearTimeout(timer);
    });
    globalThis.__TEST_TIMERS__.intervals.forEach((timer) => {
      clearInterval(timer);
    });
  }

  // Reset console
  console.log = console.info = console.warn = console.error;
});

// Mock localStorage for testing
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    length: 0,
    key: () => null,
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

// Mock document.cookie for testing
let cookieStore = '';
Object.defineProperty(global, 'document', {
  value: {
    cookie: {
      get() {
        return cookieStore;
      },
      set(value: string) {
        cookieStore = value;
      },
    },
  },
  configurable: true,
});

// Mock window.location for testing
Object.defineProperty(global, 'window', {
  value: {
    location: {
      href: 'http://localhost:3000',
      pathname: '/',
      protocol: 'http:',
    },
  },
  configurable: true,
});

// Enhanced timer mocking that tracks created timers
const originalSetTimeout = global.setTimeout;
const originalSetInterval = global.setInterval;
const originalClearTimeout = global.clearTimeout;
const originalClearInterval = global.clearInterval;

(global as any).setTimeout = ((callback: Function, delay: number, ...args: any[]) => {
  const timer = originalSetTimeout(callback, delay, ...args);
  if (globalThis.__TEST_TIMERS__) {
    globalThis.__TEST_TIMERS__.timeouts.add(timer);
  }
  return timer;
}) as typeof setTimeout;

(global as any).setInterval = ((callback: Function, delay: number, ...args: any[]) => {
  const timer = originalSetInterval(callback, delay, ...args);
  if (globalThis.__TEST_TIMERS__) {
    globalThis.__TEST_TIMERS__.intervals.add(timer);
  }
  return timer;
}) as typeof setInterval;

(global as any).clearTimeout = ((timer: NodeJS.Timeout) => {
  if (globalThis.__TEST_TIMERS__) {
    globalThis.__TEST_TIMERS__.timeouts.delete(timer);
  }
  return originalClearTimeout(timer);
}) as typeof clearTimeout;

(global as any).clearInterval = ((timer: NodeJS.Timeout) => {
  if (globalThis.__TEST_TIMERS__) {
    globalThis.__TEST_TIMERS__.intervals.delete(timer);
  }
  return originalClearInterval(timer);
}) as typeof clearInterval;

// Mock fetch for API testing
interface MockResponse {
  ok: boolean;
  status: number;
  json: () => Promise<any>;
  text: () => Promise<string>;
}

const createMockResponse = (data: any, status = 200): MockResponse => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data,
  text: async () => JSON.stringify(data),
});

// Default mock fetch implementation
(global as any).fetch = async (url: string | URL, init?: RequestInit): Promise<MockResponse> => {
  // Mock authentication endpoints
  if (url.toString().includes('/api/auth/verify')) {
    const authHeader = (init?.headers as Record<string, string>)?.['Authorization'] || '';
    if (authHeader.includes('valid-token')) {
      return createMockResponse({ user: { id: 'test-user', email: 'test@example.com', role: 'USER' } });
    }
    return createMockResponse({ error: 'Invalid token' }, 401);
  }

  if (url.toString().includes('/api/auth/refresh')) {
    return createMockResponse({ accessToken: 'new-valid-token' });
  }

  if (url.toString().includes('/api/auth/login')) {
    const body = JSON.parse(init?.body as string || '{}');
    if (body.email === 'test@example.com' && body.password === 'password') {
      return createMockResponse({
        accessToken: 'valid-token',
        user: { id: 'test-user', email: 'test@example.com', role: 'USER' }
      });
    }
    return createMockResponse({ error: 'Invalid credentials' }, 401);
  }

  // Default response for unknown endpoints
  return createMockResponse({ message: 'Not Found' }, 404);
};

export { localStorageMock };
