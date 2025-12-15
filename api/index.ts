// Vercel serverless function entry point
import app from '../src/server.js';
import { connectDB } from '../src/config/database.js';
import mongoose from 'mongoose';

// Connection promise cache to avoid multiple simultaneous connection attempts
let connectionPromise: Promise<void> | null = null;

// Ensure database connection for Vercel (blocking until connected)
const ensureDbConnection = async (): Promise<void> => {
  // If already connected, return immediately
  if (mongoose.connection.readyState === 1) {
    console.log('✅ MongoDB already connected');
    return;
  }

  // If connection is in progress, wait for it
  if (connectionPromise) {
    console.log('⏳ MongoDB connection in progress, waiting...');
    return connectionPromise;
  }

  // Start new connection attempt
  console.log('🔄 Starting MongoDB connection...');
  connectionPromise = (async () => {
    try {
      await connectDB();
      console.log('✅ MongoDB Connected for Vercel');
    } catch (error: any) {
      console.error('❌ MongoDB connection error:', error?.message || error);
      connectionPromise = null; // Reset so we can retry
      throw error;
    }
  })();

  return connectionPromise;
};

// Export the app - Vercel will use it directly
// The connection is handled in the middleware in server.ts
export default app;

