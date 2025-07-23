import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Appointment from '@/models/Appointment';
import User from '@/models/User';
import Service from '@/models/Service';
import { requireAuth, hasRole, ROLES } from '@/lib/auth';
import { appointmentSchema } from '@/lib/validations';

// GET appointments with filtering
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const tokenPayload = await requireAuth(req);
    if (!tokenPayload) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let filter: any = {};

    // Role-based filtering
    if (tokenPayload.role === ROLES.PATIENT) {
      filter.patient = tokenPayload.userId;
    } else if (tokenPayload.role === ROLES.DENTIST) {
      filter.dentist = tokenPayload.userId;
    }
    // Admin can see all appointments

    // Additional filters
    if (status) {
      filter.status = status;
    }

    if (startDate && endDate) {
      filter.appointmentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const appointments = await Appointment.find(filter)
      .populate('patient', 'name email phone')
      .populate('dentist', 'name email')
      .populate('service', 'name duration price category')
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .lean();

    return NextResponse.json({
      appointments: appointments.map((appointment: any) => ({
        id: appointment._id.toString(),
        patient: appointment.patient,
        dentist: appointment.dentist,
        service: appointment.service,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        duration: appointment.duration,
        status: appointment.status,
        symptoms: appointment.symptoms,
        notes: appointment.notes,
        price: appointment.price,
        paymentStatus: appointment.paymentStatus,
        createdAt: appointment.createdAt,
      })),
    });

  } catch (error) {
    console.error('Get appointments error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new appointment
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const tokenPayload = await requireAuth(req);
    if (!tokenPayload) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = appointmentSchema.parse(body);

    // Verify the dentist exists and has the right role
    const dentist = await User.findById(validatedData.dentistId);
    if (!dentist || !hasRole(dentist.role, [ROLES.DENTIST, ROLES.ADMIN])) {
      return NextResponse.json(
        { error: 'Invalid dentist selected' },
        { status: 400 }
      );
    }

    // Verify the service exists
    const service = await Service.findById(validatedData.serviceId);
    if (!service || !service.isActive) {
      return NextResponse.json(
        { error: 'Invalid service selected' },
        { status: 400 }
      );
    }

    // Check for scheduling conflicts
    const appointmentDateTime = new Date(validatedData.appointmentDate);
    const existingAppointment = await Appointment.findOne({
      dentist: validatedData.dentistId,
      appointmentDate: appointmentDateTime,
      appointmentTime: validatedData.appointmentTime,
      status: { $in: ['scheduled', 'confirmed'] },
    });

    if (existingAppointment) {
      return NextResponse.json(
        { error: 'This time slot is already booked' },
        { status: 400 }
      );
    }

    // Create appointment
    const appointment = new Appointment({
      patient: tokenPayload.userId,
      dentist: validatedData.dentistId,
      service: validatedData.serviceId,
      appointmentDate: appointmentDateTime,
      appointmentTime: validatedData.appointmentTime,
      duration: service.duration,
      symptoms: validatedData.symptoms,
      notes: validatedData.notes,
      price: service.price,
    });

    await appointment.save();

    // Populate the appointment for response
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone')
      .populate('dentist', 'name email')
      .populate('service', 'name duration price category')
      .lean();

    const appointment_data = populatedAppointment as any;
    return NextResponse.json({
      message: 'Appointment booked successfully',
      appointment: {
        id: appointment_data._id.toString(),
        patient: appointment_data.patient,
        dentist: appointment_data.dentist,
        service: appointment_data.service,
        appointmentDate: appointment_data.appointmentDate,
        appointmentTime: appointment_data.appointmentTime,
        duration: appointment_data.duration,
        status: appointment_data.status,
        symptoms: appointment_data.symptoms,
        notes: appointment_data.notes,
        price: appointment_data.price,
        paymentStatus: appointment_data.paymentStatus,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Create appointment error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
