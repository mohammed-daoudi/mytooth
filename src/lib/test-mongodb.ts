// Test-specific MongoDB configuration
import mongoose from 'mongoose';

// This will be set by our test setup
let isConnected = false;

export async function connectTestDB(uri: string) {
  if (isConnected) return;

  try {
    await mongoose.connect(uri);
    isConnected = true;
    console.log('Connected to test MongoDB');
  } catch (error) {
    console.error('Test MongoDB connection error:', error);
    throw error;
  }
}

export async function disconnectTestDB() {
  if (!isConnected) return;
  
  await mongoose.disconnect();
  isConnected = false;
  console.log('Disconnected from test MongoDB');
}

export async function clearTestDB() {
  if (!isConnected) return;
  
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
}
