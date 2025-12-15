import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

// Load env variables
dotenv.config();

const app = express();
// Trust proxy for Vercel (and other reverse proxies)
// This is required for express-rate-limit to work correctly behind a proxy
app.set('trust proxy', true);


// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api', apiLimiter);

// Middleware to ensure database connection (for serverless functions)
// Note: This is a backup check. The main connection should be handled in api/index.ts for Vercel
app.use('/api', async (req, res, next) => {
  const connectionState = mongoose.connection.readyState;
  console.log(`🔍 API request to ${req.path}, DB state: ${connectionState}`);
  
  if (connectionState !== 1) {
    // Not connected, try to connect
    console.log('⚠️ Database not connected, attempting connection...');
    try {
      await connectDB();
      console.log('✅ Database connection established in middleware');
    } catch (error: any) {
      console.error('❌ Database connection error in middleware:', error?.message || error);
      return res.status(503).json({
        success: false,
        error: 'Database connection failed',
        message: 'Unable to connect to database. Please try again.',
      });
    }
  }
  next();
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Yooreed Event API is running',
    mongodb: {
      state: mongoose.connection.readyState,
      stateText: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown',
      database: mongoose.connection.name,
      host: mongoose.connection.host,
    }
  });
});

// Database diagnostic endpoint
app.get('/api/debug/db', async (_req, res) => {
  try {
    const { Product } = await import('./models/Product.js');
    const { Category } = await import('./models/Category.js');
    
    const productCount = await Product.countDocuments({});
    const categoryCount = await Category.countDocuments({});
    const sampleProducts = await Product.find({}).limit(5).select('nom categorie');
    
    res.json({
      success: true,
      mongodb: {
        state: mongoose.connection.readyState,
        stateText: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown',
        database: mongoose.connection.name,
        host: mongoose.connection.host,
      },
      collections: {
        products: {
          total: productCount,
          sample: sampleProducts,
        },
        categories: {
          total: categoryCount,
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

// Routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import quoteRoutes from './routes/quoteRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/upload', uploadRoutes);

// Error handling
app.use(errorHandler);

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Connect DB and start server
// Only auto-connect and start server in local development (not on Vercel)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  connectDB()
    .then(() => {
      console.log('✅ Database connected successfully');
      // Start server only if not in production (for local development)
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
      });
    })
    .catch((error) => {
      console.error('❌ Database connection failed:', error);
      process.exit(1);
    });
}

// IMPORTANT : In production (Passenger), app.listen() is NOT called
// Passenger starts the server automatically

export default app;
