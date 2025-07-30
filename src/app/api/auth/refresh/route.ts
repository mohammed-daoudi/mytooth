import { NextRequest, NextResponse } from 'next/server';
import { verifyTokenDetailed, generateToken, generateRefreshToken, getTokenFromRequest } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    // Check if the token is a refresh token or expired access token
    const verification = verifyTokenDetailed(token);

    if (!verification.success && verification.error !== 'expired') {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // For expired tokens, try to decode the payload without verification
    let userId: string;
    let email: string;
    let role: string;

    if (verification.success) {
      userId = verification.payload!.userId;
      email = verification.payload!.email;
      role = verification.payload!.role;
    } else {
      // Token is expired, decode without verification to get user info
      try {
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.decode(token) as any;
        if (!decoded || !decoded.userId) {
          return NextResponse.json(
            { error: 'Invalid token payload' },
            { status: 401 }
          );
        }
        userId = decoded.userId;
        email = decoded.email;
        role = decoded.role;
      } catch {
        return NextResponse.json(
          { error: 'Failed to decode token' },
          { status: 401 }
        );
      }
    }

    // Verify user still exists and is active
    await connectDB();
    const user = await User.findById(userId).select('email role deletedAt');

    if (!user || user.deletedAt) {
      return NextResponse.json(
        { error: 'User no longer exists' },
        { status: 401 }
      );
    }

    // Generate new tokens
    const newAccessToken = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    });

    const newRefreshToken = generateRefreshToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      tokenType: 'refresh'
    });

    // Set tokens in response headers and cookies
    const response = NextResponse.json({
      success: true,
      accessToken: newAccessToken,
      message: 'Tokens refreshed successfully'
    });

    // Set tokens in HTTP-only cookies for security
    response.cookies.set('auth-token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60, // 1 hour
      path: '/'
    });

    response.cookies.set('refresh-token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
