import Joi from 'joi';

export const createContestSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  description: Joi.string().allow(null, '').optional(),
  access_level: Joi.string().valid('normal', 'vip').required(),
  starts_at: Joi.date().iso().optional().allow(null),
  ends_at: Joi.date().iso().optional().allow(null),
  prize_title: Joi.string().optional().allow(null, ''),
  prize_details: Joi.string().optional().allow(null, ''),
  created_by: Joi.string().guid({ version: 'uuidv4' }).optional().allow(null),
});

export const updateContestSchema = Joi.object({
  name: Joi.string().min(1).max(255).optional(),
  description: Joi.string().allow(null, '').optional(),
  access_level: Joi.string().valid('normal', 'vip').optional(),
  starts_at: Joi.date().iso().optional().allow(null),
  ends_at: Joi.date().iso().optional().allow(null),
  prize_title: Joi.string().optional().allow(null, ''),
  prize_details: Joi.string().optional().allow(null, ''),
  created_by: Joi.string().guid({ version: 'uuidv4' }).optional().allow(null),
}).min(1);
