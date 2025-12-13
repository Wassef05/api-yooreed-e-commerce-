import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.js';
import { AppError } from './errorHandler.js';

export interface AuthRequest extends Request {
  admin?: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new AppError('Token d\'authentification manquant', 401);
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback-secret'
    ) as { id: string };

    const admin = await Admin.findById(decoded.id).select('-passwordHash');

    if (!admin) {
      throw new AppError('Admin non trouvé', 404);
    }

    req.admin = {
      id: admin._id.toString(),
      username: admin.username,
      email: admin.email,
      role: admin.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Token invalide', 401));
    } else {
      next(error);
    }
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.admin) {
      next(new AppError('Non autorisé', 403));
      return;
    }

    if (!roles.includes(req.admin.role)) {
      next(new AppError('Accès refusé. Rôle insuffisant.', 403));
      return;
    }

    next();
  };
};

