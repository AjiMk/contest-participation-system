import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../types/index.js';

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    error: message,
    code: err.code,
  });
};
