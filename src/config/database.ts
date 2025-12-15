import mongoose from 'mongoose';

// Use Atlas cluster by default; override with MONGODB_URI if provided
// Default points to yooreedevent cluster and database
const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://wassef:Qbl9pELrqQ0inj49@yooreedevent.l3mmgqh.mongodb.net/yooreedevent?retryWrites=true&w=majority&appName=yooreedevent';

export const connectDB = async (): Promise<void> => {
  try {
    // Log connection attempt (hide sensitive info)
    const uriToLog = process.env.MONGODB_URI 
      ? `mongodb+srv://***@${MONGODB_URI.split('@')[1]?.split('/')[0] || 'hidden'}/...`
      : 'default URI';
    console.log(`🔄 Attempting MongoDB connection to: ${uriToLog}`);
    console.log(`📊 Current connection state: ${mongoose.connection.readyState} (0=disconnected, 1=connected, 2=connecting, 3=disconnecting)`);
    
    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Connection state after connect: ${mongoose.connection.readyState}`);
    console.log(`🗄️  Database name: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.error('❌ MONGODB_URI present:', !!process.env.MONGODB_URI);
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

