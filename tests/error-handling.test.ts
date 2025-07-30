/**
 * Error Handling System Tests
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { NextRequest } from 'next/server';
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  DatabaseError,
  ExternalServiceError,
  Logger,
  getRequestContext,
  handleApiError
} from '../src/lib/errorHandler';

// Mock NextRequest for testing
function createMockRequest(pathname: string = '/api/test'): NextRequest {
  const url = `http://localhost:3000${pathname}`;
  const headers = new Headers({
    'x-forwarded-for': '127.0.0.1',
    'user-agent': 'test-agent',
    'x-request-id': 'test-request-id'
  });

  return new NextRequest(url, { headers, method: 'POST' });
}

describe('Error Handling System', () => {
  describe('Error Classes', () => {
    test('should create AppError with correct properties', () => {
      const error = new AppError('Test error', 400, true, 'TEST_ERROR');

      assert.strictEqual(error.message, 'Test error');
      assert.strictEqual(error.statusCode, 400);
      assert.strictEqual(error.isOperational, true);
      assert.strictEqual(error.code, 'TEST_ERROR');
      assert.ok(error.stack);
    });

    test('should create ValidationError', () => {
      const error = new ValidationError('Invalid input');

      assert.strictEqual(error.message, 'Invalid input');
      assert.strictEqual(error.statusCode, 400);
      assert.strictEqual(error.code, 'VALIDATION_ERROR');
      assert.strictEqual(error.name, 'ValidationError');
    });

    test('should create AuthenticationError', () => {
      const error = new AuthenticationError();

      assert.strictEqual(error.message, 'Authentication required');
      assert.strictEqual(error.statusCode, 401);
      assert.strictEqual(error.code, 'AUTHENTICATION_ERROR');
    });

    test('should create AuthorizationError', () => {
      const error = new AuthorizationError();

      assert.strictEqual(error.message, 'Insufficient permissions');
      assert.strictEqual(error.statusCode, 403);
      assert.strictEqual(error.code, 'AUTHORIZATION_ERROR');
    });

    test('should create NotFoundError', () => {
      const error = new NotFoundError('User');

      assert.strictEqual(error.message, 'User not found');
      assert.strictEqual(error.statusCode, 404);
      assert.strictEqual(error.code, 'NOT_FOUND_ERROR');
    });

    test('should create ConflictError', () => {
      const error = new ConflictError('Resource already exists');

      assert.strictEqual(error.message, 'Resource already exists');
      assert.strictEqual(error.statusCode, 409);
      assert.strictEqual(error.code, 'CONFLICT_ERROR');
    });

    test('should create RateLimitError', () => {
      const error = new RateLimitError();

      assert.strictEqual(error.message, 'Too many requests');
      assert.strictEqual(error.statusCode, 429);
      assert.strictEqual(error.code, 'RATE_LIMIT_ERROR');
    });

    test('should create DatabaseError', () => {
      const originalError = new Error('Connection failed');
      const error = new DatabaseError('DB operation failed', originalError);

      assert.strictEqual(error.message, 'DB operation failed');
      assert.strictEqual(error.statusCode, 500);
      assert.strictEqual(error.code, 'DATABASE_ERROR');
      assert.strictEqual(error.stack, originalError.stack);
    });

    test('should create ExternalServiceError', () => {
      const error = new ExternalServiceError('PaymentService');

      assert.strictEqual(error.message, 'External service error: PaymentService');
      assert.strictEqual(error.statusCode, 502);
      assert.strictEqual(error.code, 'EXTERNAL_SERVICE_ERROR');
    });
  });

  describe('Logger', () => {
    test('should be singleton', () => {
      const logger1 = Logger.getInstance();
      const logger2 = Logger.getInstance();

      assert.strictEqual(logger1, logger2);
    });

    test('should set and use request ID', () => {
      const logger = Logger.getInstance();
      const testRequestId = 'test-request-123';

      logger.setRequestId(testRequestId);

      // We can't easily test console output, but we can verify the method exists
      assert.strictEqual(typeof logger.info, 'function');
      assert.strictEqual(typeof logger.warn, 'function');
      assert.strictEqual(typeof logger.error, 'function');
      assert.strictEqual(typeof logger.debug, 'function');
    });
  });

  describe('Request Context', () => {
    test('should extract request context', () => {
      const request = createMockRequest('/api/users');
      const context = getRequestContext(request, 'user123', 'USER');

      assert.strictEqual(context.userId, 'user123');
      assert.strictEqual(context.userRole, 'USER');
      assert.strictEqual(context.endpoint, '/api/users');
      assert.strictEqual(context.method, 'POST');
      assert.strictEqual(context.ip, '127.0.0.1');
      assert.strictEqual(context.userAgent, 'test-agent');
      assert.strictEqual(context.requestId, 'test-request-id');
      assert.ok(context.timestamp);
    });
  });

  describe('API Error Handler', () => {
    test('should handle AppError correctly', () => {
      const error = new ValidationError('Invalid email format');
      const response = handleApiError(error);

      assert.strictEqual(response.status, 400);

      // We can't easily test the response body without more setup,
      // but we can verify the function returns a NextResponse
      assert.ok(response);
      assert.strictEqual(typeof response.json, 'function');
    });

    test('should handle unknown errors', () => {
      const error = new Error('Unknown error');
      const response = handleApiError(error);

      assert.strictEqual(response.status, 500);
      assert.ok(response);
    });

    test('should handle Zod validation errors', () => {
      // Mock a Zod error structure
      const zodError = {
        name: 'ZodError',
        errors: [
          { path: ['email'], message: 'Invalid email format' }
        ]
      };

      const response = handleApiError(zodError);

      assert.strictEqual(response.status, 400);
      assert.ok(response);
    });

    test('should handle MongoDB errors', () => {
      // Mock a MongoDB error
      const mongoError = {
        name: 'MongoError',
        message: 'Connection timeout'
      };

      const response = handleApiError(mongoError);

      assert.strictEqual(response.status, 500);
      assert.ok(response);
    });
  });

  describe('Error Context', () => {
    test('should include context in error handling', () => {
      const request = createMockRequest('/api/bookings');
      const context = getRequestContext(request, 'user456', 'DENTIST');
      const error = new AuthorizationError('Cannot access this resource');

      const response = handleApiError(error, context);

      assert.strictEqual(response.status, 403);
      assert.ok(response);
    });
  });
});
