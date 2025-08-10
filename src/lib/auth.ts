import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

export const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-testing-only';

console.log('🔐 [AUTH] JWT_SECRET loaded:', !!JWT_SECRET);
console.log('🔐 [AUTH] JWT_SECRET length:', JWT_SECRET?.length || 0);

if (!JWT_SECRET || JWT_SECRET === 'fallback-secret-for-testing-only') {
  console.warn('⚠️ [AUTH] Using fallback JWT_SECRET - this should only happen in testing');
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number; // issued at
  exp?: number; // expiration time
}

export interface RefreshTokenPayload {
  userId: string;
  email: string;
  role: string;
  tokenType: 'refresh';
}

export interface TokenVerificationResult {
  success: boolean;
  payload?: TokenPayload;
  error?: 'expired' | 'invalid' | 'malformed';
  needsRefresh?: boolean;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Generate access token (short-lived)
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '1h', // 1 hour access token
    issuer: 'my-tooth-clinic',
    audience: 'my-tooth-users'
  });
}

// Generate refresh token (long-lived)
export function generateRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d', // 7 days refresh token
    issuer: 'my-tooth-clinic',
    audience: 'my-tooth-users'
  });
}

// Enhanced token verification with detailed error handling
export function verifyTokenDetailed(token: string): TokenVerificationResult {
  try {
    console.log('🔐 [AUTH] Verifying token with length:', token.length);
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'my-tooth-clinic',
      audience: 'my-tooth-users'
    }) as TokenPayload;

    console.log('✅ [AUTH] Token verified successfully:', {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      exp: decoded.exp
    });

    return {
      success: true,
      payload: decoded
    };
  } catch (error) {
    console.error('🚨 [AUTH] Token verification error:', error);
    if (error instanceof jwt.TokenExpiredError) {
      console.log('⏰ [AUTH] Token expired');
      return {
        success: false,
        error: 'expired',
        needsRefresh: true
      };
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.log('❌ [AUTH] Invalid token');
      return {
        success: false,
        error: 'invalid'
      };
    } else {
      console.log('💥 [AUTH] Malformed token');
      return {
        success: false,
        error: 'malformed'
      };
    }
  }
}

// Legacy verify function (for backwards compatibility)
export function verifyToken(token: string): TokenPayload | null {
  console.log('🔐 [AUTH] Legacy verifyToken called');
  const result = verifyTokenDetailed(token);
  return result.success ? result.payload! : null;
}

// Check if token is expired without throwing
export function isTokenExpired(token: string): boolean {
  try {
    jwt.verify(token, JWT_SECRET);
    return false;
  } catch (error) {
    return error instanceof jwt.TokenExpiredError;
  }
}

// Get token expiration time
export function getTokenExpiration(token: string): Date | null {
  try {
    const decoded = jwt.decode(token) as TokenPayload;
    if (decoded && decoded.exp) {
      return new Date(decoded.exp * 1000);
    }
    return null;
  } catch {
    return null;
  }
}

// Check if token will expire soon (within 5 minutes)
export function willTokenExpireSoon(token: string): boolean {
  const expiration = getTokenExpiration(token);
  if (!expiration) return true;

  const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
  return expiration < fiveMinutesFromNow;
}

// Extract token from request
export function getTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Also check cookies
  const tokenCookie = req.cookies.get('auth-token');
  if (tokenCookie) {
    return tokenCookie.value;
  }

  return null;
}

// Enhanced authentication middleware with expiration handling
export async function requireAuth(req: NextRequest): Promise<TokenVerificationResult & { payload?: TokenPayload }> {
  const token = getTokenFromRequest(req);

  if (!token) {
    return { success: false, error: 'invalid' };
  }

  return verifyTokenDetailed(token);
}

// Legacy middleware (for backwards compatibility)
export async function requireAuthLegacy(req: NextRequest): Promise<TokenPayload | null> {
  const result = await requireAuth(req);
  return result.success ? result.payload! : null;
}

// Check if user has required role
export function hasRole(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole);
}

// Role hierarchy
export const ROLES = {
  USER: 'USER',
  DENTIST: 'DENTIST',
  ADMIN: 'ADMIN',
  PATIENT: 'patient'
} as const;

export function hasPermission(userRole: string, action: string): boolean {
  const permissions = {
    [ROLES.USER]: ['view_own_appointments', 'book_appointment', 'cancel_appointment', 'view_own_profile'],
    [ROLES.PATIENT]: ['view_own_appointments', 'book_appointment', 'cancel_appointment', 'view_own_profile'],
    [ROLES.DENTIST]: ['view_appointments', 'update_appointment', 'view_patients', 'manage_reviews'],
    [ROLES.ADMIN]: ['manage_users', 'manage_services', 'view_all_appointments', 'manage_system']
  };

  const userPermissions = permissions[userRole as keyof typeof permissions] || [];
  return userPermissions.includes(action);
}
