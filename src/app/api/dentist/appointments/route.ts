import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Appointment from '@/models/Appointment';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify dentist authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded || (decoded.role !== 'DENTIST' && decoded.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build query - filter by dentist ID
    interface DentistAppointmentQuery {
      dentistId: string;
      status?: string;
      startsAt?: {
        $gte: Date;
        $lte: Date;
      };
    }
    const query: DentistAppointmentQuery = { dentistId: decoded.userId };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      query.startsAt = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }

    const appointments = await Appointment.find(query)
      .populate('userId', 'name email phone')
      .populate('serviceId', 'name duration price category')
      .sort({ startsAt: 1 })
      .limit(limit)
      .lean();

    // Get stats for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayAppointments, pendingCount, completedToday] = await Promise.all([
      Appointment.countDocuments({
        dentistId: decoded.userId,
        startsAt: { $gte: today, $lt: tomorrow }
      }),
      Appointment.countDocuments({
        dentistId: decoded.userId,
        status: 'PENDING'
      }),
      Appointment.countDocuments({
        dentistId: decoded.userId,
        startsAt: { $gte: today, $lt: tomorrow },
        status: 'COMPLETED'
      })
    ]);

    return NextResponse.json({
      appointments,
      stats: {
        todayAppointments,
        pendingCount,
        completedToday
      }
    });

  } catch (error) {
    console.error('Error fetching dentist appointments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
