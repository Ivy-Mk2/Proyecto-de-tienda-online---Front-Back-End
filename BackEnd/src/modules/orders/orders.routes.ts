import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';
import { asyncHandler } from '../../shared/utils/async-handler';
import { ordersController } from './orders.controller';

const router = Router();
const idParamSchema = z.object({ params: z.object({ id: z.string().min(1) }) });

router.use(requireAuth);
router.post('/checkout', asyncHandler(ordersController.checkout));
router.get('/', asyncHandler(ordersController.list));
router.get('/:id', validate(idParamSchema), asyncHandler(ordersController.getById));

export { router as ordersRoutes };
