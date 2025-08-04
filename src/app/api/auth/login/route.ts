import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyPassword, generateToken, generateRefreshToken } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';
import { authRateLimit } from '@/lib/rateLimit';
import {
  withApiHandlers,
  AuthenticationError,
  ValidationError,
  DatabaseError,
  getRequestContext,
  Logger
} from '@/lib/errorHandler';

const loginHandler = async (request: NextRequest): Promise<NextResponse> => {
  // Apply rate limiting
  const rateLimitResponse = await authRateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const logger = Logger.getInstance();
  const context = getRequestContext(request);

  try {
    await connectDB();
  } catch (error) {
    throw new DatabaseError('Failed to connect to database', error instanceof Error ? error : undefined);
  }

  let body;
  try {
    body = await request.json();
  } catch (error) {
    throw new ValidationError('Invalid JSON in request body');
  }

  // Validate request data
  const validatedData = loginSchema.parse(body);

  // Find user by email
  let user;
  try {
    user = await User.findOne({
      email: validatedData.email.toLowerCase(),
      deletedAt: { $exists: false } // Exclude soft-deleted users
    });
  } catch (error) {
    throw new DatabaseError('Failed to query user', error instanceof Error ? error : undefined);
  }

  if (!user) {
    logger.warn('Login attempt with invalid email', context, {
      email: validatedData.email.toLowerCase()
    });
    throw new AuthenticationError('Invalid email or password');
  }

  // Verify password
  let isValidPassword;
  try {
    isValidPassword = await verifyPassword(validatedData.password, user.password);
  } catch (error) {
    throw new AuthenticationError('Password verification failed');
  }

  if (!isValidPassword) {
    logger.warn('Login attempt with invalid password', context, {
      userId: user._id.toString(),
      email: user.email
    });
    throw new AuthenticationError('Invalid email or password');
  }

  // Check if user account is active
  if (user.deletedAt) {
    logger.warn('Login attempt on deleted account', context, {
      userId: user._id.toString(),
      email: user.email
    });
    throw new AuthenticationError('Account is no longer active');
  }

  // Generate JWT tokens
  let accessToken, refreshToken;
  try {
    accessToken = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    refreshToken = generateRefreshToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      tokenType: 'refresh',
    });
  } catch (error) {
    throw new Error('Failed to generate authentication tokens');
  }

  // Log successful login
  logger.info('User logged in successfully', {
    ...context,
    userId: user._id.toString(),
    userRole: user.role
  }, {
    userEmail: user.email,
    userRole: user.role
  });

  // Return user data (without password)
  const userData = {
    userId: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    profileImage: user.profileImage,
  };

  const response = NextResponse.json({
    message: 'Login successful',
    token: accessToken,
    user: userData,
  });

  // Set tokens in HTTP-only cookies for security
  response.cookies.set('auth-token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60, // 1 hour
    path: '/'
  });

  response.cookies.set('refresh-token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/'
  });

  return response;
};

export const POST = withApiHandlers(loginHandler);
