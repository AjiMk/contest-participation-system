import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { signToken, getTokenExpiryUnix } from '../utils/jwt';
import type { RegisterPayload, LoginPayload } from '../shared/types/auth';
import type { UserOutput } from '../models/User';

// Type alias for a runtime User instance returned by Sequelize
type UserInstance = InstanceType<typeof User>;

type PlainUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  password?: string;
};

// Helper: convert a Sequelize User instance to a plain typed object.
function toPlainUser(u: UserInstance): PlainUser {
  // If sequelize instance provides toJSON, use it (preferred)
  // Prefer calling the instance method directly so `this` stays bound
  if (typeof (u as unknown as { toJSON?: () => unknown }).toJSON === 'function') {
    return (u as unknown as { toJSON: () => unknown }).toJSON() as UserOutput & { password?: string };
  }

  // Fallback: read properties from the instance in a type-safe-ish way
  const rec = u as unknown as Record<string, unknown>;
  const created = rec['createdAt'] ? new Date(String(rec['createdAt'])) : new Date();
  const updated = rec['updatedAt'] ? new Date(String(rec['updatedAt'])) : new Date();
  return {
    id: String(rec['id'] ?? ''),
    email: String(rec['email'] ?? ''),
    password: typeof rec['password'] === 'string' ? (rec['password'] as string) : undefined,
    firstName: String(rec['firstName'] ?? ''),
    lastName: String(rec['lastName'] ?? ''),
    role: (rec['role'] as 'user' | 'admin') ?? 'user',
    createdAt: created,
    updatedAt: updated,
  };
}

export async function registerUser(data: RegisterPayload): Promise<{ user: Omit<UserOutput, 'password'>; token: string; expiresAt: string | null }> {
  const email = data.email.toLowerCase();
  // check if user already exists
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    throw new Error('User already exists');
  }

  const hash = await bcrypt.hash(data.password, 10);
  const user = (await User.create({ ...data, email, password: hash, role: data.role || 'user' })) as UserInstance;

  const plain = toPlainUser(user);
  const token = signToken({ userId: plain.id, email: plain.email, role: plain.role });
  const expUnix = getTokenExpiryUnix(token);
  const expiresAt = expUnix ? new Date(expUnix * 1000).toISOString() : null;
  // remove password before returning
  const { password: _pw, ...safeUser } = plain;
  return { user: safeUser as Omit<UserOutput, 'password'>, token, expiresAt };
}

export async function loginUser(email: string, password: string): Promise<{ user: Omit<UserOutput, 'password'>; token: string; expiresAt: string | null }> {
  // explicitly select password field to ensure it's returned
  const user = (await User.findOne({ where: { email }, attributes: ['id', 'email', 'password', 'firstName', 'lastName', 'role'] })) as UserInstance | null;
  if (!user) throw new Error('Invalid credentials');

  // get the stored hash reliably from the plain object
  const plain = toPlainUser(user);
  const storedHash: string | undefined = plain.password;
  if (!storedHash) throw new Error('Invalid credentials');

  try {
    const isValid = await bcrypt.compare(password, storedHash);
    if (!isValid) throw new Error('Invalid credentials');
  } catch (err) {
    // Hide internal bcrypt errors and return a generic message
    throw new Error('Invalid credentials');
  }

  const token = signToken({ userId: plain.id, email: plain.email, role: plain.role });
  const expUnix = getTokenExpiryUnix(token);
  const expiresAt = expUnix ? new Date(expUnix * 1000).toISOString() : null;
  // return sanitized user
  const { password: _pw, ...safeUser } = plain;
  return { user: safeUser as Omit<UserOutput, 'password'>, token, expiresAt };
}
