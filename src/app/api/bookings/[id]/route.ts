import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Appointment from '@/models/Appointment';
import { verifyTokenDetailed } from '@/lib/auth';
import { apiRateLimit } from '@/lib/rateLimit';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  // Apply rate limiting
  const rateLimitResponse = await apiRateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const verification = verifyTokenDetailed(token);

    if (!verification.success) {
      if (verification.error === 'expired') {
        return NextResponse.json(
          { error: 'Token expired', needsRefresh: true },
          { status: 401 }
        );
      }
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const decoded = verification.payload!;
    const { id } = params;

    await connectDB();

    // Find the booking with full population
    const booking = await Appointment.findById(id)
      .populate('userId', 'name email phone profileImage address emergencyContact')
      .populate('dentistId', 'name email phone profileImage specialization rating')
      .populate('serviceId', 'name duration price category description')
      .lean() as any;

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check permissions - users can only see their own bookings unless they're staff
    const isPatient = decoded.userId === booking.userId.toString();
    const isDentist = decoded.role === 'DENTIST' && decoded.userId === booking.dentistId.toString();
    const isAdmin = decoded.role === 'ADMIN';

    if (!isPatient && !isDentist && !isAdmin) {
      return NextResponse.json(
        { error: 'You do not have permission to view this booking' },
        { status: 403 }
      );
    }

    // Calculate end time
    const startTime = new Date(booking.startsAt);
    const endTime = new Date(startTime.getTime() + booking.serviceId.duration * 60000);

    // Format the response
    const bookingDetails = {
      id: booking._id.toString(),
      patient: {
        name: booking.userId.name,
        email: booking.userId.email,
        phone: booking.userId.phone,
        profileImage: booking.userId.profileImage,
        address: booking.userId.address,
        emergencyContact: booking.userId.emergencyContact
      },
      dentist: {
        name: booking.dentistId.name,
        email: booking.dentistId.email,
        phone: booking.dentistId.phone,
        specialization: booking.dentistId.specialization,
        profileImage: booking.dentistId.profileImage,
        rating: booking.dentistId.rating
      },
      service: {
        name: booking.serviceId.name,
        duration: booking.serviceId.duration,
        price: booking.serviceId.price,
        category: booking.serviceId.category,
        description: booking.serviceId.description
      },
      startsAt: booking.startsAt,
      endsAt: endTime,
      status: booking.status,
      symptoms: booking.symptoms,
      notes: booking.notes,
      clinicalNotes: booking.clinicalNotes,
      price: booking.price,
      paymentStatus: booking.paymentStatus,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    };

    return NextResponse.json({
      success: true,
      booking: bookingDetails
    });

  } catch (error) {
    console.error('Error fetching booking details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  // Apply rate limiting
  const rateLimitResponse = await apiRateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const verification = verifyTokenDetailed(token);

    if (!verification.success) {
      if (verification.error === 'expired') {
        return NextResponse.json(
          { error: 'Token expired', needsRefresh: true },
          { status: 401 }
        );
      }
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const decoded = verification.payload!;
    const { id } = params;
    const updateData = await request.json();

    await connectDB();

    // Find the booking
    const booking = await Appointment.findById(id);
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const isPatient = decoded.userId === booking.userId.toString();
    const isDentist = decoded.role === 'DENTIST' && decoded.userId === booking.dentistId.toString();
    const isAdmin = decoded.role === 'ADMIN';

    if (!isPatient && !isDentist && !isAdmin) {
      return NextResponse.json(
        { error: 'You do not have permission to modify this booking' },
        { status: 403 }
      );
    }

    // Restrict what different roles can update
    let allowedUpdates: string[] = [];

    if (isAdmin) {
      allowedUpdates = ['status', 'notes', 'clinicalNotes', 'price', 'paymentStatus', 'startsAt'];
    } else if (isDentist) {
      allowedUpdates = ['status', 'clinicalNotes', 'notes'];
    } else if (isPatient) {
      // Patients can only update if booking is still pending
      if (booking.status === 'PENDING') {
        allowedUpdates = ['symptoms', 'notes'];
      }
    }

    // Filter the update data to only include allowed fields
    const filteredUpdates: any = {};
    for (const [key, value] of Object.entries(updateData)) {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = value;
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Update the booking
    const updatedBooking = await Appointment.findByIdAndUpdate(
      id,
      { ...filteredUpdates, updatedAt: new Date() },
      { new: true }
    )
      .populate('userId', 'name email phone profileImage')
      .populate('dentistId', 'name email specialization')
      .populate('serviceId', 'name duration price category');

    return NextResponse.json({
      success: true,
      message: 'Booking updated successfully',
      booking: updatedBooking
    });

  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  // Apply rate limiting
  const rateLimitResponse = await apiRateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const verification = verifyTokenDetailed(token);

    if (!verification.success) {
      if (verification.error === 'expired') {
        return NextResponse.json(
          { error: 'Token expired', needsRefresh: true },
          { status: 401 }
        );
      }
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const decoded = verification.payload!;
    const { id } = params;

    await connectDB();

    // Find the booking
    const booking = await Appointment.findById(id);
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check permissions - only patients can cancel their own bookings, or admins
    const isPatient = decoded.userId === booking.userId.toString();
    const isAdmin = decoded.role === 'ADMIN';

    if (!isPatient && !isAdmin) {
      return NextResponse.json(
        { error: 'You do not have permission to cancel this booking' },
        { status: 403 }
      );
    }

    // Check if booking can be cancelled
    if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
      return NextResponse.json(
        { error: 'This booking cannot be cancelled' },
        { status: 400 }
      );
    }

    // Update status to CANCELLED instead of deleting
    const updatedBooking = await Appointment.findByIdAndUpdate(
      id,
      {
        status: 'CANCELLED',
        updatedAt: new Date(),
        cancelledAt: new Date()
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking: updatedBooking
    });

  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
