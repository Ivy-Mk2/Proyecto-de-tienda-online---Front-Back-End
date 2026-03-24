import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';
import { asyncHandler } from '../../shared/utils/async-handler';
import { authController } from './auth.controller';
import { loginSchema, logoutSchema, refreshSchema, registerSchema } from './auth.schema';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: 'Too many auth attempts, please try again later' },
});

router.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  asyncHandler(authController.register),
);
router.post('/login', authLimiter, validate(loginSchema), asyncHandler(authController.login));
router.post('/refresh', validate(refreshSchema), asyncHandler(authController.refresh));
router.post('/logout', validate(logoutSchema), asyncHandler(authController.logout));
router.get('/me', requireAuth, asyncHandler(authController.me));

export { router as authRoutes };
