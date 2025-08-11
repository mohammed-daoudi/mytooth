// This file runs before any tests to set up the testing environment
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

// Set up in-memory MongoDB server before any tests run
let mongoServer: MongoMemoryServer;

export default async function globalSetup() {
  // Start MongoDB memory server
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  // Set the test database URI in environment variables
  process.env.MONGODB_URI = uri;
  
  // Connect to the in-memory database
  await mongoose.connect(uri);
  
  // Load models after connection is established
  await Promise.all([
    import('@/models/User'),
    import('@/models/Dentist'),
    import('@/models/Service'),
    import('@/models/Appointment'),
  ]);
  
  // Return a teardown function
  return async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  };
}
