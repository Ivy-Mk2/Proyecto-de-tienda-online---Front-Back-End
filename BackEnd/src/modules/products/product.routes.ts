import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { requireAuth, requireRole } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';
import { asyncHandler } from '../../shared/utils/async-handler';
import { upload } from '../uploads/upload.middleware';
import { productController } from './product.controller';
import {
  createProductSchema,
  imageDeleteSchema,
  listProductsSchema,
  productParamSchema,
  updateProductSchema,
} from './product.schema';

const router = Router();

router.get('/', validate(listProductsSchema), asyncHandler(productController.list));
router.get('/:id', validate(productParamSchema), asyncHandler(productController.getById));

router.post(
  '/',
  requireAuth,
  requireRole(UserRole.ADMIN),
  validate(createProductSchema),
  asyncHandler(productController.create),
);
router.patch(
  '/:id',
  requireAuth,
  requireRole(UserRole.ADMIN),
  validate(updateProductSchema),
  asyncHandler(productController.update),
);
router.delete(
  '/:id',
  requireAuth,
  requireRole(UserRole.ADMIN),
  validate(productParamSchema),
  asyncHandler(productController.remove),
);
router.post(
  '/:id/images',
  requireAuth,
  requireRole(UserRole.ADMIN),
  upload.single('image'),
  asyncHandler(productController.addImage),
);
router.delete(
  '/:id/images/:imageId',
  requireAuth,
  requireRole(UserRole.ADMIN),
  validate(imageDeleteSchema),
  asyncHandler(productController.removeImage),
);

export { router as productRoutes };
