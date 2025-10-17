import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';

/**
 * requireRole - middleware factory to allow only specific roles to access a route.
 *
 * Usage:
 *   app.post('/admin', requireAuth, requireRole(['ADMIN']), handler)
 *   app.get('/contests', requireRole(['GUEST', 'USER', 'VIP', 'ADMIN']), handler)
 */
export function requireRole(allowedRoles: string[]) {
  const normalized = allowedRoles.map((r) => r.toUpperCase());

  return (req: Request, res: Response, next: NextFunction) => {

    // Cast to AuthRequest only when we need the user property; keeps runtime signature compatible
    const authReq = req as AuthRequest;

    // If no authenticated user is attached, treat as guest
    const user = authReq.user;
    if (!user) {
      if (normalized.includes('GUEST')) return next();
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const role = (user.role || '').toUpperCase();

    // Admins bypass all checks
    if (role === 'ADMIN') return next();

    // Direct role match
    if (normalized.includes(role)) return next();

    // Role hierarchies: VIP can access USER (NORMAL) resources
    if (role === 'VIP' && normalized.includes('USER')) return next();

    return res.status(403).json({ success: false, message: 'Insufficient permissions' });
  };
}
