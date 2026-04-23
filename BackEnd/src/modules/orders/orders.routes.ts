import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { z } from 'zod';
import { requireAuth, requireRole } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';
import { asyncHandler } from '../../shared/utils/async-handler';
import { ordersController } from './orders.controller';

const router = Router();

const idParamSchema = z.object({ params: z.object({ id: z.string().min(1) }) });

const shippingAddressSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(6),
  address: z.string().min(5),
  district: z.string().min(2),
  city: z.string().min(2),
  notes: z.string().optional(),
});

const checkoutSchema = z.object({
  body: z.object({
    shippingAddress: shippingAddressSchema.optional(),
  }),
});

router.use(requireAuth);

router.post('/checkout', validate(checkoutSchema), asyncHandler(ordersController.checkout));
router.get('/admin', requireRole(UserRole.ADMIN), asyncHandler(ordersController.adminList));
router.get('/', asyncHandler(ordersController.list));
router.get('/:id', validate(idParamSchema), asyncHandler(ordersController.getById));

export { router as ordersRoutes };
