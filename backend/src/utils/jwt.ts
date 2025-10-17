import jwt from 'jsonwebtoken';
import { TokenPayload } from '../types/index';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export function signToken(payload: TokenPayload) {
  // Ensure payload contains required claims; convert to plain object to avoid sequelize instances
  const userId = payload?.userId ? String(payload.userId) : '';
  const email = payload?.email ? String(payload.email) : '';
  const role = payload?.role ? String(payload.role) : '';

  if (!userId || !email) {
    // Log a helpful warning to aid debugging when tokens lack claims
    // eslint-disable-next-line no-console
    console.warn('signToken: missing userId or email in payload', { userId, email, role });
  }

  const claims = { userId, email, role };
  return jwt.sign(claims as any, JWT_SECRET as any, { expiresIn: JWT_EXPIRES_IN } as any);
}

export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, JWT_SECRET as any) as any;
  // Ensure the returned object has the expected shape
  return {
    userId: decoded.userId ?? '',
    email: decoded.email ?? '',
    role: decoded.role ?? '',
  } as TokenPayload;
}
