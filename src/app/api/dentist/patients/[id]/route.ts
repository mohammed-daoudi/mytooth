import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Appointment from '@/models/Appointment';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
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

    // Get patient details
    const patient = await User.findById(params.id)
      .select('name email phone dateOfBirth address medicalHistory emergencyContact profileImage')
      .lean();

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Get all appointments for this patient with this dentist
    const appointments = await Appointment.find({
      userId: params.id,
      dentistId: decoded.userId
    })
      .populate('serviceId', 'name duration price category')
      .sort({ startsAt: -1 })
      .lean();

    // Calculate patient statistics
    const totalVisits = appointments.filter(apt => apt.status === 'COMPLETED').length;
    const pendingAppointments = appointments.filter(apt => apt.status === 'PENDING').length;
    const nextAppointment = appointments.find(apt =>
      ['PENDING', 'CONFIRMED'].includes(apt.status) &&
      new Date(apt.startsAt) > new Date()
    );
    const lastVisit = appointments.find(apt => apt.status === 'COMPLETED');

    // Calculate total spent
    const totalSpent = appointments
      .filter(apt => apt.status === 'COMPLETED')
      .reduce((sum, apt) => sum + (apt.price || 0), 0);

    return NextResponse.json({
      patient: {
        ...patient,
        totalVisits,
        pendingAppointments,
        nextAppointment: nextAppointment?.startsAt || null,
        lastVisit: lastVisit?.startsAt || null,
        totalSpent
      },
      appointments,
      stats: {
        totalVisits,
        pendingAppointments,
        totalSpent,
        hasNextAppointment: !!nextAppointment
      }
    });

  } catch (error) {
    console.error('Error fetching patient details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
