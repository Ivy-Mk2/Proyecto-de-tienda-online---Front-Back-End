import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';
import { asyncHandler } from '../../shared/utils/async-handler';
import { authController } from './auth.controller';
import {
  facebookAuthSchema,
  googleAuthSchema,
  loginSchema,
  registerSchema,
} from './auth.schema';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: 'Too many auth attempts, please try again later' },
});

router.post('/register', authLimiter, validate(registerSchema), asyncHandler(authController.register));
router.post('/login', authLimiter, validate(loginSchema), asyncHandler(authController.login));
router.post('/google', authLimiter, validate(googleAuthSchema), asyncHandler(authController.google));
router.post('/facebook', authLimiter, validate(facebookAuthSchema), asyncHandler(authController.facebook));
// refresh and logout read token from HttpOnly cookie — no body schema needed
router.post('/refresh', asyncHandler(authController.refresh));
router.post('/logout', asyncHandler(authController.logout));
router.get('/me', requireAuth, asyncHandler(authController.me));

export { router as authRoutes };
