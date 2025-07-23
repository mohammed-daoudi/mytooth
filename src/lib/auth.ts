import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env.local');
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
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

// Generate JWT token
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
    issuer: 'my-tooth-clinic',
    audience: 'my-tooth-users'
  });
}

// Verify JWT token
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'my-tooth-clinic',
      audience: 'my-tooth-users'
    }) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
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

// Middleware to check authentication
export async function requireAuth(req: NextRequest): Promise<TokenPayload | null> {
  const token = getTokenFromRequest(req);

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  return payload;
}

// Check if user has required role
export function hasRole(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole);
}

// Role hierarchy
export const ROLES = {
  PATIENT: 'patient',
  DENTIST: 'dentist',
  ADMIN: 'admin'
} as const;

export function hasPermission(userRole: string, action: string): boolean {
  const permissions = {
    [ROLES.PATIENT]: ['view_own_appointments', 'book_appointment', 'cancel_appointment', 'view_own_profile'],
    [ROLES.DENTIST]: ['view_appointments', 'update_appointment', 'view_patients', 'manage_reviews'],
    [ROLES.ADMIN]: ['manage_users', 'manage_services', 'view_all_appointments', 'manage_system']
  };

  const userPermissions = permissions[userRole as keyof typeof permissions] || [];
  return userPermissions.includes(action);
}
