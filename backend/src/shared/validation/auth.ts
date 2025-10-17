import Joi from 'joi';
import type { RegisterPayload, LoginPayload } from '../types/auth';

export const registerSchema = Joi.object<RegisterPayload>({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().min(1).max(100).required(),
  lastName: Joi.string().min(1).max(100).required(),
  role: Joi.string().valid('user', 'admin').optional(),
});

export const loginSchema = Joi.object<LoginPayload>({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
