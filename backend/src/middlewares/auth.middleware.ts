import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../lib/jwt';

export interface AuthenticatedRequest extends Request {
  user?: { userId: string; email: string };
}

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
