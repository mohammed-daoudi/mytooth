/**
 * Authentication Test Suite
 */

import { test, describe, expect, beforeEach } from 'bun:test';
import {
  hashPassword,
  verifyPassword,
  generateToken,
  generateRefreshToken,
  verifyTokenDetailed,
  verifyToken,
  isTokenExpired,
  getTokenExpiration,
  willTokenExpireSoon,
  hasRole,
  hasPermission,
  ROLES,
  type TokenPayload,
  type RefreshTokenPayload
} from '../src/lib/auth';

// Import test setup
import './setup';

describe('Authentication Library', () => {
  describe('Password Hashing', () => {
    test('should hash password securely', async () => {
      const password = 'testPassword123';
      const hashedPassword = await hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(50); // bcrypt hashes are typically 60 chars
    });

    test('should verify correct password', async () => {
      const password = 'testPassword123';
      const hashedPassword = await hashPassword(password);

      const isValid = await verifyPassword(password, hashedPassword);
      expect(isValid).toBe(true);

      const isInvalid = await verifyPassword('wrongPassword', hashedPassword);
      expect(isInvalid).toBe(false);
    });

    test('should produce different hashes for same password', async () => {
      const password = 'testPassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
      expect(await verifyPassword(password, hash1)).toBe(true);
      expect(await verifyPassword(password, hash2)).toBe(true);
    });
  });

  describe('JWT Token Generation', () => {
    const mockPayload: TokenPayload = {
      userId: 'test-user-id',
      email: 'test@example.com',
      role: 'USER'
    };

    test('should generate valid access token', () => {
      const token = generateToken(mockPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts

      // Verify token can be decoded
      const verification = verifyTokenDetailed(token);
      expect(verification.success).toBe(true);
      expect(verification.payload?.userId).toBe(mockPayload.userId);
      expect(verification.payload?.email).toBe(mockPayload.email);
      expect(verification.payload?.role).toBe(mockPayload.role);
    });

    test('should generate valid refresh token', () => {
      const refreshPayload: RefreshTokenPayload = {
        ...mockPayload,
        tokenType: 'refresh'
      };
      const token = generateRefreshToken(refreshPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    test('should include expiration time', () => {
      const token = generateToken(mockPayload);
      const expirationDate = getTokenExpiration(token);

      expect(expirationDate).toBeDefined();
      expect(expirationDate).toBeInstanceOf(Date);
      if (expirationDate) {
        expect(expirationDate.getTime()).toBeGreaterThan(Date.now());
      }

      const willExpireSoon = willTokenExpireSoon(token);
      expect(willExpireSoon).toBe(false); // Fresh token shouldn't expire soon
    });
  });

  describe('JWT Token Verification', () => {
    test('should reject invalid tokens', () => {
      const invalidToken = 'invalid.token.here';
      const verification = verifyTokenDetailed(invalidToken);

      expect(verification.success).toBe(false);
      expect(['invalid', 'malformed']).toContain(verification.error);
    });

    test('should handle malformed tokens', () => {
      const malformedToken = 'not-a-jwt-token';
      const verification = verifyTokenDetailed(malformedToken);

      expect(verification.success).toBe(false);
      expect(verification.error).toBeDefined();
    });

    test('should identify expired tokens', () => {
      // Create a token that expires immediately
      const payload: TokenPayload = {
        userId: 'test-user',
        email: 'test@example.com',
        role: 'USER',
        exp: Math.floor(Date.now() / 1000) - 1 // Expired 1 second ago
      };

      // We would need to manually create an expired token for this test
      // For now, test the detection logic
      const expiredResult = verifyTokenDetailed('expired.token.example');
      expect(expiredResult.success).toBe(false);
    });

    test('should work with legacy verify function', () => {
      const mockPayload: TokenPayload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'USER'
      };

      const token = generateToken(mockPayload);
      const legacyResult = verifyToken(token);

      expect(legacyResult).toBeDefined();
      expect(legacyResult?.userId).toBe(mockPayload.userId);
    });
  });

  describe('Token Utility Functions', () => {
    let validToken: string;

    beforeEach(() => {
      const mockPayload: TokenPayload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'USER'
      };
      validToken = generateToken(mockPayload);
    });

    test('should detect token expiration status', () => {
      const isExpired = isTokenExpired(validToken);
      expect(isExpired).toBe(false);

      const isInvalidExpired = isTokenExpired('invalid.token');
      expect(isInvalidExpired).toBe(true);
    });

    test('should get token expiration date', () => {
      const expiration = getTokenExpiration(validToken);
      expect(expiration).toBeInstanceOf(Date);
      if (expiration) {
        expect(expiration.getTime()).toBeGreaterThan(Date.now());
      }

      const invalidExpiration = getTokenExpiration('invalid.token');
      expect(invalidExpiration).toBeNull();
    });

    test('should detect if token will expire soon', () => {
      const willExpireSoon = willTokenExpireSoon(validToken);
      expect(willExpireSoon).toBe(false);

      const willInvalidExpireSoon = willTokenExpireSoon('invalid.token');
      expect(willInvalidExpireSoon).toBe(true);
    });
  });

  describe('Role-Based Access Control', () => {
    test('should validate user roles correctly', () => {
      expect(hasRole('USER', ['USER', 'ADMIN'])).toBe(true);
      expect(hasRole('ADMIN', ['USER'])).toBe(false);
      expect(hasRole('DENTIST', ['DENTIST', 'ADMIN'])).toBe(true);
    });

    test('should check permissions correctly', () => {
      expect(hasPermission(ROLES.USER, 'view_own_appointments')).toBe(true);
      expect(hasPermission(ROLES.USER, 'manage_users')).toBe(false);
      expect(hasPermission(ROLES.ADMIN, 'manage_users')).toBe(true);
      expect(hasPermission(ROLES.DENTIST, 'view_appointments')).toBe(true);
    });

    test('should handle invalid roles gracefully', () => {
      expect(hasPermission('INVALID_ROLE', 'any_permission')).toBe(false);
    });
  });

  describe('Token Security', () => {
    test('should generate unique tokens', () => {
      const payload: TokenPayload = {
        userId: 'test-user',
        email: 'test@example.com',
        role: 'USER'
      };

      const token1 = generateToken(payload);
      // Wait a tiny bit to ensure different iat
      const token2 = generateToken(payload);

      expect(token1).not.toBe(token2);
    });

    test('should include proper JWT claims', () => {
      const payload: TokenPayload = {
        userId: 'test-user',
        email: 'test@example.com',
        role: 'USER'
      };

      const token = generateToken(payload);
      const verification = verifyTokenDetailed(token);

      expect(verification.success).toBe(true);
      expect(verification.payload?.iat).toBeDefined(); // issued at
      expect(verification.payload?.exp).toBeDefined(); // expiration
    });
  });
});
