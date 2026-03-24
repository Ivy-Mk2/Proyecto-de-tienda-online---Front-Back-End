import { NextFunction, Request, Response } from 'express';
import { UserRole } from '@prisma/client';
import { AppError } from '../errors/app-error';
import { verifyAccessToken } from '../utils/jwt';

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new AppError(401, 'Missing or invalid authorization header');
  }

  const token = header.split(' ')[1];
  const payload = verifyAccessToken(token);

  req.authUser = {
    id: payload.sub,
    email: payload.email,
    role: payload.role as UserRole,
  };

  next();
};

export const requireRole = (role: UserRole) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.authUser) {
      throw new AppError(401, 'Unauthorized');
    }

    if (req.authUser.role !== role) {
      throw new AppError(403, 'Forbidden');
    }

    next();
  };
};
