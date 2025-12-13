import jwt, { SignOptions } from 'jsonwebtoken';

export const generateToken = (id: string): string => {
  const secret: string = process.env.JWT_SECRET || 'fallback-secret';
  const expiresIn = process.env.JWT_EXPIRE || '7d';

  return jwt.sign({ id }, secret, { expiresIn } as SignOptions);
};

