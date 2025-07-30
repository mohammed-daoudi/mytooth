import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Appointment from '@/models/Appointment';
import User from '@/models/User';
import Service from '@/models/Service';
import { requireAuth, hasRole, ROLES } from '@/lib/auth';
import { appointmentSchema } from '@/lib/validations';

// Define types for MongoDB documents
interface PopulatedAppointment {
  _id: string;
  patient: { name: string; email: string; phone?: string };
  dentist: { name: string; email: string };
  service: { name: string; duration: number; price: number; category: string };
  appointmentDate: Date;
  appointmentTime: string;
  duration: number;
  status: string;
  symptoms?: string;
  notes?: string;
  price: number;
  paymentStatus: string;
  createdAt: Date;
}

interface AppointmentFilter {
  userId?: string;
  dentistId?: string;
  status?: string;
  startsAt?: {
    $gte: Date;
    $lte: Date;
  };
}

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

    const filter: AppointmentFilter = {};

    // Role-based filtering
    if (tokenPayload.payload!.role === ROLES.USER || tokenPayload.payload!.role === ROLES.PATIENT) {
      filter.userId = tokenPayload.payload!.userId;
    } else if (tokenPayload.payload!.role === ROLES.DENTIST) {
      filter.dentistId = tokenPayload.payload!.userId;
    }
    // Admin can see all appointments

    // Additional filters
    if (status) {
      filter.status = status;
    }

    if (startDate && endDate) {
      filter.startsAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const appointments = await Appointment.find(filter)
      .populate('userId', 'name email phone')
      .populate('dentistId', 'name email')
      .populate('serviceId', 'name duration price category')
      .sort({ startsAt: 1 })
      .lean();

    return NextResponse.json({
      appointments: appointments.map((appointment: unknown) => {
        const doc = appointment as PopulatedAppointment;
        return {
          id: doc._id.toString(),
          patient: doc.patient,
          dentist: doc.dentist,
          service: doc.service,
          appointmentDate: doc.appointmentDate,
          appointmentTime: doc.appointmentTime,
          duration: doc.duration,
          status: doc.status,
          symptoms: doc.symptoms,
          notes: doc.notes,
          price: doc.price,
          paymentStatus: doc.paymentStatus,
          createdAt: doc.createdAt,
        };
      }),
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

    // Combine date and time into startsAt
    const appointmentDate = new Date(validatedData.appointmentDate);
    const [hours, minutes] = validatedData.appointmentTime.split(':');
    appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // Check for scheduling conflicts
    const existingAppointment = await Appointment.findOne({
      dentistId: validatedData.dentistId,
      startsAt: appointmentDate,
      status: { $in: ['PENDING', 'CONFIRMED'] },
    });

    if (existingAppointment) {
      return NextResponse.json(
        { error: 'This time slot is already booked' },
        { status: 400 }
      );
    }

    // Calculate end time
    const endsAt = new Date(appointmentDate);
    endsAt.setMinutes(endsAt.getMinutes() + service.duration);

    // Create appointment
    const appointment = new Appointment({
      userId: tokenPayload.payload!.userId,
      dentistId: validatedData.dentistId,
      serviceId: validatedData.serviceId,
      startsAt: appointmentDate,
      endsAt: endsAt,
      symptoms: validatedData.symptoms,
      notes: validatedData.notes,
      price: service.price,
    });

    await appointment.save();

    // Populate the appointment for response
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('userId', 'name email phone')
      .populate('dentistId', 'name email')
      .populate('serviceId', 'name duration price category')
      .lean();

    if (!populatedAppointment) {
      return NextResponse.json(
        { error: 'Failed to retrieve appointment details' },
        { status: 500 }
      );
    }

    interface PopulatedAppointment {
      _id: string;
      userId: { name: string; email: string; phone: string };
      dentistId: { name: string; email: string };
      serviceId: { name: string; duration: number; price: number; category: string };
      startsAt: Date;
      status: string;
      symptoms: string;
      notes: string;
      price: number;
      paymentStatus: string;
    }
    const appointment_data = populatedAppointment as any as PopulatedAppointment;

    return NextResponse.json({
      message: 'Appointment booked successfully',
      appointment: {
        id: appointment_data._id.toString(),
        patient: appointment_data.userId,
        dentist: appointment_data.dentistId,
        service: appointment_data.serviceId,
        startsAt: appointment_data.startsAt,
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
