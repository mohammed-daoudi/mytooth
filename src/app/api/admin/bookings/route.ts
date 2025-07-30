import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Appointment from '@/models/Appointment';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded || (decoded.role !== 'ADMIN' && decoded.role !== 'DENTIST')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const dentistId = searchParams.get('dentistId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build query
    interface BookingQuery {
      status?: string;
      dentistId?: string;
      startsAt?: {
        $gte?: Date;
        $lte?: Date;
      };
    }
    const query: BookingQuery = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (dentistId && dentistId !== 'all') {
      query.dentistId = dentistId;
    }

    if (dateFrom || dateTo) {
      query.startsAt = {};
      if (dateFrom) {
        query.startsAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.startsAt.$lte = new Date(dateTo);
      }
    }

    const skip = (page - 1) * limit;

    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .populate('userId', 'name email phone')
        .populate('dentistId', 'name email')
        .populate('serviceId', 'name duration price category')
        .sort({ startsAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Appointment.countDocuments(query)
    ]);

    return NextResponse.json({
      appointments,
      total,
      page,
      pages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
