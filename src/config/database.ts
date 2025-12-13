import mongoose from 'mongoose';

// Use Atlas cluster by default; override with MONGODB_URI if provided
// Default points to yooreedevent cluster and database
const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://wassef:Qbl9pELrqQ0inj49@yooreedevent.l3mmgqh.mongodb.net/yooreedevent?retryWrites=true&w=majority&appName=yooreedevent';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  console.error('❌ MongoDB error:', error);
});

