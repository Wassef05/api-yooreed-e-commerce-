import app from '../src/server';
import { connectDB } from '../src/config/database';
import mongoose from 'mongoose';

// Ensure database connection for Vercel serverless functions
// Mongoose handles connection pooling and reconnection automatically
const ensureDbConnection = async () => {
  // Check if already connected
  if (mongoose.connection.readyState === 1) {
    return; // Already connected
  }
  
  try {
    await connectDB();
    console.log('✅ MongoDB Connected for Vercel');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    // Don't throw - connection will be retried on next request
    // Mongoose will handle reconnection automatically
  }
};

// Try to connect on cold start (non-blocking)
// This won't block the function from starting
ensureDbConnection().catch(() => {
  // Silent catch - connection will be retried on first request
});

export default app;

