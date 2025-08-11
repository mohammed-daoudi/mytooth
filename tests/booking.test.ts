import { describe, it, expect, beforeAll, afterAll, afterEach } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { createMocks } from 'node-mocks-http';
import { NextRequest } from 'next/server';
import { GET, POST, PUT, DELETE } from '../src/app/api/bookings/route';
import Appointment from '../src/models/Appointment';
import User from '../src/models/User';
import Dentist from '../src/models/Dentist';
import Service from '../src/models/Service';

// Mock auth middleware
jest.mock('@/lib/auth', () => ({
  requireAuth: jest.fn(),
}));

// Mock socket.io
jest.mock('@/lib/socket', () => ({
  getIO: jest.fn().mockReturnValue({
    emit: jest.fn(),
  }),
}));

describe('Booking System API', () => {
  let mongoServer: MongoMemoryServer;
  let testUser: any;
  let testDentist: any;
  let testService: any;
  let testAppointment: any;
  let validToken: string;

  beforeAll(async () => {
    // Setup in-memory MongoDB for testing
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    // Create test user
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'patient',
    });

    // Create test dentist
    testDentist = await Dentist.create({
      name: 'Dr. Test Dentist',
      email: 'dentist@example.com',
      specialization: 'General Dentistry',
      yearsOfExperience: 5,
      consultationFee: 100,
      isActive: true,
    });

    // Create test service
    testService = await Service.create({
      name: 'Dental Checkup',
      description: 'Routine dental examination',
      duration: 30, // minutes
      price: 75,
      category: 'general',
    });

    // Mock auth middleware to return test user
    const { requireAuth } = require('@/lib/auth');
    requireAuth.mockImplementation((req: NextRequest) => ({
      payload: {
        userId: testUser._id,
        role: 'patient',
      },
    }));
  });

  afterEach(async () => {
    await Appointment.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('POST /api/bookings', () => {
    it('should create a new appointment', async () => {
      const startsAt = new Date();
      startsAt.setHours(10, 0, 0, 0); // 10:00 AM
      
      const { req } = createMocks({
        method: 'POST',
        body: {
          dentistId: testDentist._id,
          serviceId: testService._id,
          startsAt: startsAt.toISOString(),
          notes: 'Test appointment',
        },
      });

      const response = await POST(req as unknown as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.booking).toBeDefined();
      expect(data.booking.userId).toBe(testUser._id.toString());
      expect(data.booking.dentistId).toBe(testDentist._id.toString());
      expect(data.booking.status).toBe('PENDING');
    });

    it('should prevent double booking', async () => {
      const startsAt = new Date();
      startsAt.setHours(11, 0, 0, 0); // 11:00 AM
      
      // Create first booking
      await Appointment.create({
        userId: testUser._id,
        dentistId: testDentist._id,
        serviceId: testService._id,
        startsAt,
        endsAt: new Date(startsAt.getTime() + 30 * 60000), // 30 minutes later
        status: 'CONFIRMED',
      });

      // Try to create overlapping booking
      const { req } = createMocks({
        method: 'POST',
        body: {
          dentistId: testDentist._id,
          serviceId: testService._id,
          startsAt: startsAt.toISOString(),
          notes: 'Overlapping appointment',
        },
      });

      const response = await POST(req as unknown as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe('Time slot is not available');
    });
  });

  describe('GET /api/bookings', () => {
    it('should retrieve user appointments', async () => {
      // Create test appointments
      const now = new Date();
      const pastAppointment = await Appointment.create({
        userId: testUser._id,
        dentistId: testDentist._id,
        serviceId: testService._id,
        startsAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Yesterday
        endsAt: new Date(now.getTime() - 23.5 * 60 * 60 * 1000),
        status: 'COMPLETED',
      });

      const upcomingAppointment = await Appointment.create({
        userId: testUser._id,
        dentistId: testDentist._id,
        serviceId: testService._id,
        startsAt: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
        endsAt: new Date(now.getTime() + 24.5 * 60 * 60 * 1000),
        status: 'CONFIRMED',
      });

      const { req } = createMocks({
        method: 'GET',
        url: '/api/bookings',
      });

      const response = await GET(req as unknown as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.bookings).toHaveLength(2);
      expect(data.bookings.some((a: any) => a._id === pastAppointment._id.toString())).toBe(true);
      expect(data.bookings.some((a: any) => a._id === upcomingAppointment._id.toString())).toBe(true);
    });
  });

  describe('PUT /api/bookings/[id]', () => {
    it('should update an existing appointment', async () => {
      const startsAt = new Date();
      startsAt.setDate(startsAt.getDate() + 2); // 2 days from now
      startsAt.setHours(14, 0, 0, 0); // 2:00 PM

      const appointment = await Appointment.create({
        userId: testUser._id,
        dentistId: testDentist._id,
        serviceId: testService._id,
        startsAt,
        endsAt: new Date(startsAt.getTime() + 30 * 60000),
        status: 'PENDING',
      });

      const newTime = new Date(startsAt.getTime() + 60 * 60 * 1000); // 1 hour later

      const { req } = createMocks({
        method: 'PUT',
        url: `/api/bookings/${appointment._id}`,
        body: {
          startsAt: newTime.toISOString(),
          status: 'CONFIRMED',
        },
      });

      const response = await PUT(req as unknown as NextRequest, { params: { id: appointment._id } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.booking.startsAt).toBe(newTime.toISOString());
      expect(data.booking.status).toBe('CONFIRMED');
    });
  });

  describe('DELETE /api/bookings/[id]', () => {
    it('should cancel an appointment', async () => {
      const startsAt = new Date();
      startsAt.setDate(startsAt.getDate() + 3); // 3 days from now
      startsAt.setHours(15, 0, 0, 0); // 3:00 PM

      const appointment = await Appointment.create({
        userId: testUser._id,
        dentistId: testDentist._id,
        serviceId: testService._id,
        startsAt,
        endsAt: new Date(startsAt.getTime() + 30 * 60000),
        status: 'CONFIRMED',
      });

      const { req } = createMocks({
        method: 'DELETE',
        url: `/api/bookings/${appointment._id}`,
      });

      const response = await DELETE(req as unknown as NextRequest, { params: { id: appointment._id } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Appointment cancelled successfully');
      
      // Verify appointment was cancelled
      const updatedAppointment = await Appointment.findById(appointment._id);
      expect(updatedAppointment?.status).toBe('CANCELLED');
      expect(updatedAppointment?.cancelledAt).toBeDefined();
    });
  });

  describe('Date/Time Validation', () => {
    it('should prevent booking in the past', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1); // Yesterday
      
      const { req } = createMocks({
        method: 'POST',
        body: {
          dentistId: testDentist._id,
          serviceId: testService._id,
          startsAt: pastDate.toISOString(),
          notes: 'Past appointment',
        },
      });

      const response = await POST(req as unknown as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Cannot book appointments in the past');
    });

    it('should validate working hours (9 AM - 5 PM)', async () => {
      const date = new Date();
      date.setDate(date.getDate() + 1); // Tomorrow
      date.setHours(8, 0, 0, 0); // 8:00 AM - before working hours
      
      const { req } = createMocks({
        method: 'POST',
        body: {
          dentistId: testDentist._id,
          serviceId: testService._id,
          startsAt: date.toISOString(),
          notes: 'Early morning appointment',
        },
      });

      const response = await POST(req as unknown as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('outside working hours');
    });
  });
});
