import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Appointment from '@/models/Appointment';
import User from '@/models/User';
import Dentist from '@/models/Dentist';
import Service from '@/models/Service';
import { requireAuth } from '@/lib/auth';

// GET /api/bookings - Get bookings for authenticated user
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const authPayload = await requireAuth(req);
    if (!authPayload) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const dentistId = searchParams.get('dentistId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');

    // Build query based on user role
    const query: Record<string, unknown> = {};

    if (authPayload.payload!.role === 'USER' || authPayload.payload!.role === 'patient') {
      query.userId = authPayload.payload!.userId;
    } else if (authPayload.payload!.role === 'DENTIST') {
      // Find dentist profile
      const dentist = await Dentist.findOne({ userId: authPayload.payload!.userId });
      if (dentist) {
        query.dentistId = dentist._id;
      }
    }
    // Admins can see all bookings

    if (status) {
      query.status = status;
    }

    if (dentistId && authPayload.payload!.role === 'ADMIN') {
      query.dentistId = dentistId;
    }

    const skip = (page - 1) * limit;

    const bookings = await Appointment.find(query)
      .populate('userId', 'name email phone')
      .populate('dentistId')
      .populate('serviceId', 'name duration price')
      .sort({ startsAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Appointment.countDocuments(query);

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create new booking
export async function POST(req: NextRequest) {
  try {
    // Try to connect to database
    try {
      await connectDB();
    } catch (dbError) {
      console.warn('Database connection failed:', dbError);
      return NextResponse.json(
        { error: 'Database temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    const authPayload = await requireAuth(req);
    if (!authPayload) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { dentistId, serviceId, startsAt, notes } = body;

    // Validate required fields
    if (!dentistId || !startsAt) {
      return NextResponse.json(
        { error: 'Dentist ID and start time are required' },
        { status: 400 }
      );
    }

    // Validate dentist exists
    let dentist;
    try {
      dentist = await Dentist.findById(dentistId);
    } catch (error) {
      console.error('Invalid dentist ID format:', dentistId, error);
      return NextResponse.json(
        { error: 'Invalid dentist ID format' },
        { status: 400 }
      );
    }
    
    if (!dentist) {
      return NextResponse.json(
        { error: 'Dentist not found' },
        { status: 404 }
      );
    }

    // Validate service if provided
    let service = null;
    if (serviceId) {
      try {
        service = await Service.findById(serviceId);
      } catch (error) {
        console.error('Invalid service ID format:', serviceId, error);
        return NextResponse.json(
          { error: 'Invalid service ID format' },
          { status: 400 }
        );
      }
      
      if (!service) {
        return NextResponse.json(
          { error: 'Service not found' },
          { status: 404 }
        );
      }
    }

    // Parse start time and calculate end time
    const startTime = new Date(startsAt);
    const duration = service ? service.duration : 60; // Default 60 minutes
    const endTime = new Date(startTime.getTime() + duration * 60000);

    // Check for conflicts
    const conflictingBooking = await Appointment.findOne({
      dentistId,
      $or: [
        {
          startsAt: { $lt: endTime },
          endsAt: { $gt: startTime }
        }
      ],
      status: { $in: ['PENDING', 'CONFIRMED'] }
    });

    if (conflictingBooking) {
      return NextResponse.json(
        { error: 'Time slot is not available' },
        { status: 409 }
      );
    }

    // Map role to valid createdBy values
    let createdByValue: 'USER' | 'ADMIN' | 'DENTIST' = 'USER';
    const userRole = authPayload.payload!.role;

    if (userRole === 'ADMIN') {
      createdByValue = 'ADMIN';
    } else if (userRole === 'DENTIST') {
      createdByValue = 'DENTIST';
    } else {
      // For 'USER', 'patient', or any other role, default to 'USER'
      createdByValue = 'USER';
    }

    // Create booking
    const booking = new Appointment({
      userId: authPayload.payload!.userId,
      dentistId,
      serviceId: serviceId || null,
      startsAt: startTime,
      endsAt: endTime,
      notes,
      createdBy: createdByValue,
      status: 'PENDING'
    });

    await booking.save();

    // Populate the booking for response
    await booking.populate([
      { path: 'userId', select: 'name email phone' },
      { path: 'dentistId' },
      { path: 'serviceId', select: 'name duration price' }
    ]);

    return NextResponse.json({
      message: 'Booking created successfully',
      booking
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
