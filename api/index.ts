import app from '../src/server';
import { connectDB } from '../src/config/database';

// Connect to database for Vercel
// Mongoose handles connection pooling, so multiple calls are safe
connectDB().catch((error) => {
  console.error('Database connection error:', error);
});

export default app;

