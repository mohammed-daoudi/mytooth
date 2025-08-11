import mongoose, { ConnectOptions } from 'mongoose';

// This mock will be used instead of the real mongodb.ts during tests
let isConnected = false;

export default async function connectDB() {
  if (isConnected) {
    return;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in test environment');
  }

  const options: ConnectOptions = {
    // Type-safe connection options
  };

  try {
    await mongoose.connect(process.env.MONGODB_URI, options);
    isConnected = true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}
