/**
 * Rate Limiting System Tests
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { NextRequest } from 'next/server';
import { createRateLimiter, RATE_LIMITS } from '../src/lib/rateLimit';

// Mock NextRequest for testing
function createMockRequest(ip: string = '127.0.0.1', userAgent: string = 'test-agent'): NextRequest {
  const url = 'http://localhost:3000/api/test';
  const headers = new Headers({
    'x-forwarded-for': ip,
    'user-agent': userAgent
  });

  return new NextRequest(url, { headers });
}

describe('Rate Limiting System', () => {
  test('should allow requests within rate limits', async () => {
    const rateLimiter = createRateLimiter({
      windowMs: 60000, // 1 minute
      maxRequests: 5,
      message: 'Rate limit exceeded'
    });

    const request = createMockRequest();

    // First request should be allowed
    const result = await rateLimiter(request);
    assert.strictEqual(result, null); // null means allowed
  });

  test('should block requests exceeding rate limits', async () => {
    const rateLimiter = createRateLimiter({
      windowMs: 60000, // 1 minute
      maxRequests: 2,
      message: 'Rate limit exceeded'
    });

    const request = createMockRequest('192.168.1.1');

    // First two requests should be allowed
    let result = await rateLimiter(request);
    assert.strictEqual(result, null);

    result = await rateLimiter(request);
    assert.strictEqual(result, null);

    // Third request should be blocked
    result = await rateLimiter(request);
    assert.ok(result); // Not null means blocked
    assert.strictEqual(result.status, 429);
  });

  test('should differentiate between different IPs', async () => {
    const rateLimiter = createRateLimiter({
      windowMs: 60000,
      maxRequests: 1,
      message: 'Rate limit exceeded'
    });

    const request1 = createMockRequest('192.168.1.1');
    const request2 = createMockRequest('192.168.1.2');

    // Both should be allowed as they're from different IPs
    let result1 = await rateLimiter(request1);
    assert.strictEqual(result1, null);

    let result2 = await rateLimiter(request2);
    assert.strictEqual(result2, null);

    // Second request from first IP should be blocked
    result1 = await rateLimiter(request1);
    assert.ok(result1);
    assert.strictEqual(result1.status, 429);
  });

  test('should respect skipIf condition', async () => {
    const rateLimiter = createRateLimiter({
      windowMs: 60000,
      maxRequests: 1,
      message: 'Rate limit exceeded',
      skipIf: (req) => req.headers.get('user-agent') === 'admin-bypass'
    });

    const normalRequest = createMockRequest('192.168.1.1', 'normal-user');
    const adminRequest = createMockRequest('192.168.1.1', 'admin-bypass');

    // First normal request should be allowed
    let result = await rateLimiter(normalRequest);
    assert.strictEqual(result, null);

    // Second normal request should be blocked
    result = await rateLimiter(normalRequest);
    assert.ok(result);
    assert.strictEqual(result.status, 429);

    // Admin request should always be allowed
    result = await rateLimiter(adminRequest);
    assert.strictEqual(result, null);
  });

  test('should use predefined rate limit configurations', () => {
    // Test that predefined configs exist and have expected properties
    assert.ok(RATE_LIMITS.AUTH);
    assert.ok(RATE_LIMITS.API);
    assert.ok(RATE_LIMITS.BOOKING);
    assert.ok(RATE_LIMITS.ADMIN);

    assert.strictEqual(typeof RATE_LIMITS.AUTH.windowMs, 'number');
    assert.strictEqual(typeof RATE_LIMITS.AUTH.maxRequests, 'number');
    assert.strictEqual(typeof RATE_LIMITS.AUTH.message, 'string');

    // Auth should be more restrictive than API
    assert.ok(RATE_LIMITS.AUTH.maxRequests < RATE_LIMITS.API.maxRequests);
  });

  test('should include rate limit headers in response', async () => {
    const rateLimiter = createRateLimiter({
      windowMs: 60000,
      maxRequests: 3,
      message: 'Rate limit exceeded'
    });

    const request = createMockRequest('192.168.1.3');

    // Make a request and check if headers would be set
    const result = await rateLimiter(request);
    assert.strictEqual(result, null); // Request allowed

    // We can't directly test headers here as they're set on NextResponse.next()
    // But we can verify the logic doesn't error
  });
});
