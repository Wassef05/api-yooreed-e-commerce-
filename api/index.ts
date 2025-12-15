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

// Export handler that ensures DB connection before processing requests
export default async (req: any, res: any) => {
  console.log(`📥 Incoming request: ${req.method} ${req.url}`);
  
  try {
    // Ensure database is connected before processing request
    await ensureDbConnection();
    
    // Verify connection state
    if (mongoose.connection.readyState !== 1) {
      console.error('❌ MongoDB connection state is not ready:', mongoose.connection.readyState);
      return res.status(503).json({
        success: false,
        error: 'Database connection not ready',
        message: 'Unable to connect to database. Please try again.',
      });
    }
    
    console.log(`✅ DB connection verified - DB: ${mongoose.connection.name}, State: ${mongoose.connection.readyState}`);
    
    // Process the request with the Express app
    return app(req, res);
  } catch (error: any) {
    console.error('❌ Failed to connect to database:', error?.message || error);
    console.error('❌ Error stack:', error?.stack);
    return res.status(503).json({
      success: false,
      error: 'Database connection failed',
      message: error?.message || 'Unable to connect to database. Please try again.',
    });
  }
};

