import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Appointment from '@/models/Appointment';
import { requireAuth, verifyPassword } from '@/lib/auth';
import { z } from 'zod';

const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

// DELETE /api/user/delete-account - Soft delete user account
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const authPayload = await requireAuth(req);
    if (!authPayload) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Validate input
    const validationResult = deleteAccountSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const { password } = validationResult.data;

    // Get user with password
    const user = await User.findById(authPayload.payload!.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Password is incorrect' },
        { status: 401 }
      );
    }

    // Check for active appointments
    const activeAppointments = await Appointment.find({
      userId: authPayload.payload!.userId,
      status: { $in: ['PENDING', 'CONFIRMED'] },
      startsAt: { $gte: new Date() }
    });

    if (activeAppointments.length > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete account with active appointments. Please cancel or complete your appointments first.',
          activeAppointments: activeAppointments.length
        },
        { status: 409 }
      );
    }

    // Soft delete the user account
    await User.findByIdAndUpdate(authPayload.payload!.userId, {
      deletedAt: new Date(),
      // Anonymize sensitive data
      email: `deleted_${authPayload.payload!.userId}@deleted.local`,
      name: 'Deleted User',
      phone: null,
      address: null,
      emergencyContact: null,
      medicalHistory: [],
      profileImage: null
    });

    // Cancel any future appointments
    await Appointment.updateMany(
      {
        userId: authPayload.payload!.userId,
        status: { $in: ['PENDING', 'CONFIRMED'] },
        startsAt: { $gte: new Date() }
      },
      {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        notes: 'Cancelled due to account deletion'
      }
    );

    return NextResponse.json({
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
