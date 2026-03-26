import { NextFunction, Request, Response } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { ZodError } from 'zod';
import { AppError } from '../errors/app-error';

export const errorHandler = (err: Error, _req: Request, res: Response, next: NextFunction) => {
  void next;

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({ message: 'Validation error', issues: err.issues });
  }

  if (err instanceof JsonWebTokenError || err instanceof TokenExpiredError) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  return res.status(500).json({ message: 'Internal server error' });
};
