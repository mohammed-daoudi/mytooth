import { describe, it, expect, beforeAll, afterEach, beforeEach } from 'bun:test';
import mongoose from 'mongoose';
import { createMocks } from 'node-mocks-http';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/bookings/route';
import Appointment from '@/models/Appointment';
import User from '@/models/User';
import Dentist from '@/models/Dentist';
import Service from '@/models/Service';
import jwt from 'jsonwebtoken';

// Mock the auth middleware
jest.mock('@/lib/auth', () => ({
  requireAuth: jest.fn(),
}));

// Mock the JWT secret
process.env.JWT_SECRET = 'test-secret';

// Ensure we're using the test database
beforeAll(async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in test environment');
  }
  
  // Clear all test data before tests start
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

afterEach(async () => {
  // Clear all test data after each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    try {
      await collection.deleteMany({});
    } catch (error) {
      console.error(`Error clearing collection ${key}:`, error);
    }
  }
});

describe('Booking API', () => {
  let testUser: any;
  let testDentist: any;
  let testService: any;
  let testAppointment: any;
  let validToken: string;

  beforeEach(async () => {
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
      description: 'Routine dental checkup',
      duration: 30, // minutes
      price: 75,
      category: 'general',
    });

    // Create a valid JWT token for testing
    validToken = jwt.sign(
      { userId: testUser._id, role: 'patient' },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );
  });

  describe('POST /api/bookings', () => {
    it('should create a new booking', async () => {
      // Mock the auth middleware
      const { requireAuth } = require('@/lib/auth');
      requireAuth.mockImplementation(() => ({
        payload: { userId: testUser._id, role: 'patient' },
      }));

      const startsAt = new Date();
      startsAt.setHours(10, 0, 0, 0); // 10:00 AM
      
      const { req } = createMocks({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${validToken}`
        },
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
  });

  describe('GET /api/bookings', () => {
    it('should retrieve user bookings', async () => {
      // Create a test appointment
      const startsAt = new Date();
      startsAt.setDate(startsAt.getDate() + 1); // Tomorrow
      startsAt.setHours(10, 0, 0, 0); // 10:00 AM

      const appointment = await Appointment.create({
        userId: testUser._id,
        dentistId: testDentist._id,
        serviceId: testService._id,
        startsAt,
        endsAt: new Date(startsAt.getTime() + 30 * 60000), // 30 minutes later
        status: 'CONFIRMED',
      });

      // Mock the auth middleware
      const { requireAuth } = require('@/lib/auth');
      requireAuth.mockImplementation(() => ({
        payload: { userId: testUser._id, role: 'patient' },
      }));

      const { req } = createMocks({
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${validToken}`
        },
        query: {}
      });

      const response = await GET(req as unknown as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data.bookings)).toBe(true);
      expect(data.bookings.length).toBe(1);
      expect(data.bookings[0]._id).toBe(appointment._id.toString());
    });
  });

  // Note: PUT and DELETE endpoints are not implemented in the API route
  // These tests are commented out since they require the corresponding endpoints
  
  /*
  describe('PUT /api/bookings/[id]', () => {
    // Test implementation for PUT endpoint would go here
  });

  describe('DELETE /api/bookings/[id]', () => {
    // Test implementation for DELETE endpoint would go here
  });
  */
});
