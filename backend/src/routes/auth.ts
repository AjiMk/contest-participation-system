import { Router, Request, Response } from 'express';
import { registerUser, loginUser } from '../services/authService';
import type { RegisterPayload, LoginPayload } from '../shared/types/auth';
import { registerSchema, loginSchema } from '../shared/validation/auth';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  const { error, value } = registerSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const details = (error.details as Array<{ message: string }>).map((d) => d.message);
    return res.status(400).json({ success: false, message: 'Validation error', details });
  }

  const payload = value as RegisterPayload;

  try {
    const result = await registerUser(payload);
    return res.json({ success: true, data: result });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err?.message || 'Registration failed' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  const { error, value } = loginSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const details = (error.details as Array<{ message: string }>).map((d) => d.message);
    return res.status(400).json({ success: false, message: 'Validation error', details });
  }

  const payload = value as LoginPayload;
  try {
    const result = await loginUser(payload.email, payload.password);
    return res.json({ success: true, data: result });
  } catch (err: any) {
    return res.status(401).json({ success: false, message: err?.message || 'Login failed' });
  }
});

export default router;
