import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    console.log('🔐 [VERIFY_API] Starting token verification...');
    await connectDB();

    // Verify token and get user data
    const authResult = await requireAuth(req);
    console.log('🔍 [VERIFY_API] Auth result:', { success: authResult.success, error: authResult.error });

    if (!authResult.success || !authResult.payload) {
      console.log('❌ [VERIFY_API] Token verification failed');
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    console.log('✅ [VERIFY_API] Token valid, fetching user data for:', authResult.payload.userId);

    // Get user from database
    const user = await User.findById(authResult.payload.userId).select('-password');

    if (!user) {
      console.log('❌ [VERIFY_API] User not found in database');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('✅ [VERIFY_API] User found:', user.email);

    // Return user data
    const userData = {
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      profileImage: user.profileImage,
    };

    console.log('✅ [VERIFY_API] Returning user data for:', userData.email);

    return NextResponse.json({
      success: true,
      valid: true,
      user: userData,
    });

  } catch (error) {
    console.error('🚨 [VERIFY_API] Token verification error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
