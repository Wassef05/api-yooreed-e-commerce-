// Vercel serverless function entry point
import app from '../src/server.js';
import { connectDB } from '../src/config/database.js';
import mongoose from 'mongoose';

// Ensure database connection for Vercel (non-blocking)
// Mongoose handles connection pooling and reconnection automatically
const ensureDbConnection = async () => {
  if (mongoose.connection.readyState === 1) {
    return; // Already connected
  }
  
  try {
    await connectDB();
    console.log('✅ MongoDB Connected for Vercel');
  } catch (error: any) {
    console.error('❌ MongoDB connection error (will retry):', error?.message || error);
    // Don't throw - connection will be retried on next request
  }
};

// Try to connect on cold start (non-blocking)
// This won't block the function from starting
ensureDbConnection().catch(() => {
  // Silent catch - connection will be retried on first request
});

// Export the Express app for Vercel
export default app;

