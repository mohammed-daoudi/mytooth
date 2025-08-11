// This test file uses a different approach to avoid the MongoDB connection issue

// 1. First, set up the test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';

// 2. Mock the MongoDB module before any other imports
jest.mock('@/lib/mongodb', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => Promise.resolve())
  };
});

// 3. Now import the rest of the dependencies
import { describe, it, expect, beforeAll, afterEach, jest } from '@jest/globals';
import { createMocks } from 'node-mocks-http';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/bookings/route';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

// Mock models
const mockUser = {
  _id: new mongoose.Types.ObjectId(),
  name: 'Test User',
  email: 'test@example.com',
  role: 'patient'
};

const mockDentist = {
  _id: new mongoose.Types.ObjectId(),
  name: 'Dr. Test Dentist',
  email: 'dentist@example.com',
  specialization: 'General Dentistry',
  yearsOfExperience: 5,
  consultationFee: 100,
  isActive: true
};

const mockService = {
  _id: new mongoose.Types.ObjectId(),
  name: 'Dental Checkup',
  description: 'Routine dental checkup',
  duration: 30,
  price: 75,
  category: 'general'
};

// Mock the auth middleware
jest.mock('@/lib/auth', () => ({
  requireAuth: jest.fn().mockResolvedValue({
    payload: {
      userId: mockUser._id,
      role: 'patient'
    }
  })
}));

describe('Booking API', () => {
  let testAppointment: any;
  let validToken: string;

  beforeAll(() => {
    // Create a valid JWT token for testing
    validToken = jwt.sign(
      { userId: mockUser._id, role: 'patient' },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );
  });

  describe('POST /api/bookings', () => {
    it('should create a new booking', async () => {
      const startsAt = new Date();
      startsAt.setHours(10, 0, 0, 0); // 10:00 AM
      
      const { req } = createMocks({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${validToken}`
        },
        body: {
          dentistId: mockDentist._id,
          serviceId: mockService._id,
          startsAt: startsAt.toISOString(),
          notes: 'Test appointment',
        },
      });

      const response = await POST(req as unknown as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.booking).toBeDefined();
      expect(data.booking.userId).toBe(mockUser._id.toString());
      expect(data.booking.dentistId).toBe(mockDentist._id.toString());
      expect(data.booking.status).toBe('PENDING');
    });
  });

  describe('GET /api/bookings', () => {
    it('should retrieve user bookings', async () => {
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
    });
  });
});
