import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error details
  console.error('❌ Error Handler:', {
    message: err?.message,
    statusCode: err?.statusCode,
    name: err?.name,
    stack: err?.stack,
  });

  const statusCode = err?.statusCode || err?.status || 500;
  const message = err?.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { 
        stack: err?.stack,
        name: err?.name,
        details: err,
      }),
    },
  });
};

