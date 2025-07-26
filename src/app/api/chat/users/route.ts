import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const userData = verifyToken(token);

    if (!userData) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const query: Record<string, unknown> = {
      _id: { $ne: userData.userId } // Exclude current user
    };

    // Role-based filtering
    if (userData.role === 'patient') {
      // Patients can only message admin and dentists
      query.role = { $in: ['admin', 'dentist'] };
    } else if (userData.role === 'dentist') {
      // Dentists can message anyone
      // No additional filtering needed
    } else if (userData.role === 'admin') {
      // Admins can message anyone
      // No additional filtering needed
    }

    // Add search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('name email role avatar createdAt')
      .sort({ name: 1 })
      .limit(50); // Limit results to prevent overwhelming the UI

    // Group users by role for better organization
    const groupedUsers = {
      admin: users.filter(user => user.role === 'admin'),
      dentist: users.filter(user => user.role === 'dentist'),
      patient: users.filter(user => user.role === 'patient')
    };

    return NextResponse.json({
      users: groupedUsers,
      total: users.length
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
