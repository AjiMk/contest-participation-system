import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AuthRequest } from '../types/index';

// Attaches user to req if Authorization header with a valid Bearer token is present.
// Otherwise, continues without error, leaving req.user undefined.
export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return next();
  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyToken(token);
    req.user = payload;
  } catch {
    // Ignore invalid tokens for optional auth; treat as guest
  }
  return next();
}

