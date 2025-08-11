// Integration tests for booking API with test MongoDB

// 1. First, set up the test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';

// 2. Import test utilities first
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectTestDB, disconnectTestDB, clearTestDB } from '@/lib/test-mongodb';

// 3. Import models and other dependencies
import mongoose from 'mongoose';
import { describe, it, expect, beforeAll, afterAll, afterEach } from '@jest/globals';
import { createMocks } from 'node-mocks-http';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/bookings/route';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import Dentist from '@/models/Dentist';
import Service from '@/models/Service';
import Appointment from '@/models/Appointment';

// Test data
const testUser = {
  _id: new mongoose.Types.ObjectId(),
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
  role: 'patient',
  phone: '1234567890',
  dateOfBirth: new Date('1990-01-01'),
  gender: 'male',
  address: '123 Test St',
  city: 'Test City',
  state: 'Test State',
  zipCode: '12345',
  country: 'Test Country'
};

const testDentist = {
  _id: new mongoose.Types.ObjectId(),
  name: 'Dr. Test Dentist',
  email: 'dentist@example.com',
  password: 'password123',
  role: 'dentist',
  phone: '1234567890',
  specialization: 'General Dentistry',
  yearsOfExperience: 5,
  consultationFee: 100,
  isActive: true,
  bio: 'Test Bio',
  education: ['Test University'],
  languages: ['English']
};

const testService = {
  _id: new mongoose.Types.ObjectId(),
  name: 'Dental Checkup',
  description: 'Routine dental checkup',
  duration: 30,
  price: 75,
  category: 'general',
  isActive: true
};

let mongoServer: MongoMemoryServer;
let validToken: string;

// Setup test environment
beforeAll(async () => {
  // Start MongoDB memory server
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  // Connect to test database
  await connectTestDB(uri);
  
  // Create test data
  await User.create(testUser);
  await Dentist.create(testDentist);
  await Service.create(testService);
  
  // Create a valid JWT token for testing
  validToken = jwt.sign(
    { userId: testUser._id, role: 'patient' },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );
});

afterEach(async () => {
  // Clear all test data after each test
  await clearTestDB();
});

afterAll(async () => {
  // Clean up
  await disconnectTestDB();
  await mongoServer.stop();
});

describe('Booking API Integration Tests', () => {
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
      // First, create a test booking
      const startsAt = new Date();
      startsAt.setHours(11, 0, 0, 0); // 11:00 AM
      
      await Appointment.create({
        user: testUser._id,
        dentist: testDentist._id,
        service: testService._id,
        startsAt,
        endsAt: new Date(startsAt.getTime() + 30 * 60000), // 30 minutes later
        status: 'PENDING',
        notes: 'Test appointment'
      });

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
      expect(data.bookings[0].userId).toBe(testUser._id.toString());
    });
  });
});
