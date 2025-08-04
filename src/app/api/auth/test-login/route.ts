import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    console.log('🧪 [TEST_LOGIN] Test login attempt:', email);

    // Mock user data for testing
    let mockUser;

    if (email === 'admin@mytooth.com' && password === 'admin123') {
      mockUser = {
        userId: 'admin-123',
        email: 'admin@mytooth.com',
        role: 'ADMIN',
        name: 'Admin User'
      };
    } else if (email === 'user@mytooth.com' && password === 'user123') {
      mockUser = {
        userId: 'user-456',
        email: 'user@mytooth.com',
        role: 'USER',
        name: 'Test User'
      };
    } else {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate real JWT token
    const token = generateToken({
      userId: mockUser.userId,
      email: mockUser.email,
      role: mockUser.role
    });

    console.log('✅ [TEST_LOGIN] Generated token for:', mockUser.email);

    return NextResponse.json({
      success: true,
      token,
      user: mockUser
    });

  } catch (error) {
    console.error('🚨 [TEST_LOGIN] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
