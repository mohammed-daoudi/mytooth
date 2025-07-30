import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;
  skipIf?: (req: NextRequest) => boolean;
}

interface RequestInfo {
  count: number;
  windowStart: number;
}

// In-memory store for rate limiting (in production, use Redis)
const requestCounts = new Map<string, RequestInfo>();

// Default rate limit configs for different endpoint types
export const RATE_LIMITS = {
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 login attempts per 15 minutes
    message: 'Too many authentication attempts. Please try again later.'
  },
  API: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
    message: 'Too many requests. Please slow down.'
  },
  BOOKING: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 booking operations per minute
    message: 'Too many booking requests. Please wait before trying again.'
  },
  ADMIN: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 admin operations per minute
    message: 'Rate limit exceeded for admin operations.'
  }
} as const;

function getClientIdentifier(req: NextRequest): string {
  // Get client IP from various headers (for different deployment environments)
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const clientIp = forwarded?.split(',')[0] || realIp || 'unknown';

  // Also include user agent for additional fingerprinting
  const userAgent = req.headers.get('user-agent') || 'unknown';

  return `${clientIp}-${userAgent.slice(0, 50)}`;
}

function cleanupOldEntries() {
  const now = Date.now();
  for (const [key, info] of requestCounts.entries()) {
    // Remove entries older than 1 hour to prevent memory leaks
    if (now - info.windowStart > 60 * 60 * 1000) {
      requestCounts.delete(key);
    }
  }
}

export function createRateLimiter(config: RateLimitConfig) {
  return async (req: NextRequest): Promise<NextResponse | null> => {
    // Skip rate limiting if condition is met
    if (config.skipIf && config.skipIf(req)) {
      return null;
    }

    const clientId = getClientIdentifier(req);
    const now = Date.now();

    // Clean up old entries periodically
    if (Math.random() < 0.01) { // 1% chance to cleanup
      cleanupOldEntries();
    }

    const existingInfo = requestCounts.get(clientId);

    if (!existingInfo || now - existingInfo.windowStart > config.windowMs) {
      // New window or first request
      requestCounts.set(clientId, {
        count: 1,
        windowStart: now
      });
      return null; // Allow request
    }

    if (existingInfo.count >= config.maxRequests) {
      // Rate limit exceeded
      const resetTime = existingInfo.windowStart + config.windowMs;
      const retryAfter = Math.ceil((resetTime - now) / 1000);

      return NextResponse.json(
        {
          error: config.message || 'Rate limit exceeded',
          retryAfter: retryAfter
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': resetTime.toString()
          }
        }
      );
    }

    // Increment counter
    existingInfo.count += 1;
    requestCounts.set(clientId, existingInfo);

    // Add rate limit headers
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', (config.maxRequests - existingInfo.count).toString());
    response.headers.set('X-RateLimit-Reset', (existingInfo.windowStart + config.windowMs).toString());

    return null; // Allow request
  };
}

// Specific rate limiters for different endpoints
export const authRateLimit = createRateLimiter(RATE_LIMITS.AUTH);
export const apiRateLimit = createRateLimiter(RATE_LIMITS.API);
export const bookingRateLimit = createRateLimiter(RATE_LIMITS.BOOKING);
export const adminRateLimit = createRateLimiter({
  ...RATE_LIMITS.ADMIN,
  skipIf: (req) => {
    // Skip rate limiting for admin users (you could check JWT here)
    // For now, we'll apply it to all users
    return false;
  }
});

// Helper to apply rate limiting to any handler
export function withRateLimit<T extends unknown[]>(
  rateLimiter: (req: NextRequest) => Promise<NextResponse | null>,
  handler: (req: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (req: NextRequest, ...args: T): Promise<NextResponse> => {
    const rateLimitResponse = await rateLimiter(req);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    return handler(req, ...args);
  };
}
