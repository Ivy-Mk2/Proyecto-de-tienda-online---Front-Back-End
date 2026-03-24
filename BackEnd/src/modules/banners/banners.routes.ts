import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { requireAuth, requireRole } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';
import { asyncHandler } from '../../shared/utils/async-handler';
import { bannerParamSchema, createBannerSchema, updateBannerSchema } from './banners.schema';
import { bannersController } from './banners.controller';

const router = Router();

router.get('/', asyncHandler(bannersController.list));
router.post(
  '/',
  requireAuth,
  requireRole(UserRole.ADMIN),
  validate(createBannerSchema),
  asyncHandler(bannersController.create),
);
router.patch(
  '/:id',
  requireAuth,
  requireRole(UserRole.ADMIN),
  validate(updateBannerSchema),
  asyncHandler(bannersController.update),
);
router.delete(
  '/:id',
  requireAuth,
  requireRole(UserRole.ADMIN),
  validate(bannerParamSchema),
  asyncHandler(bannersController.remove),
);

export { router as bannersRoutes };
