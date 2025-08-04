import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Appointment from '@/models/Appointment';
import User from '@/models/User';
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

    // Get all patients who have appointments with this dentist
    const patientAppointments = await Appointment.find({
      dentistId: decoded.userId
    })
      .populate('userId', 'name email phone dateOfBirth address medicalHistory emergencyContact')
      .populate('serviceId', 'name category')
      .sort({ startsAt: -1 })
      .lean();

    // Group appointments by patient
    const patientsMap = new Map();

    patientAppointments.forEach((appointment: any) => {
      const patientId = appointment.userId._id.toString();

      if (!patientsMap.has(patientId)) {
        patientsMap.set(patientId, {
          patient: appointment.userId,
          appointments: [],
          totalVisits: 0,
          lastVisit: null,
          nextAppointment: null
        });
      }

      const patientData = patientsMap.get(patientId);
      patientData.appointments.push(appointment);
      patientData.totalVisits = patientData.appointments.length;

      // Update last visit (most recent completed appointment)
      if (appointment.status === 'COMPLETED') {
        if (!patientData.lastVisit || new Date(appointment.startsAt) > new Date(patientData.lastVisit)) {
          patientData.lastVisit = appointment.startsAt;
        }
      }

      // Update next appointment (earliest pending/confirmed appointment)
      if (['PENDING', 'CONFIRMED'].includes(appointment.status) && new Date(appointment.startsAt) > new Date()) {
        if (!patientData.nextAppointment || new Date(appointment.startsAt) < new Date(patientData.nextAppointment)) {
          patientData.nextAppointment = appointment.startsAt;
        }
      }
    });

    const patients = Array.from(patientsMap.values()).map(data => ({
      ...data.patient,
      totalVisits: data.totalVisits,
      lastVisit: data.lastVisit,
      nextAppointment: data.nextAppointment,
      recentAppointments: data.appointments.slice(0, 5) // Last 5 appointments
    }));

    return NextResponse.json({
      patients,
      totalPatients: patients.length
    });

  } catch (error) {
    console.error('Error fetching dentist patients:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
