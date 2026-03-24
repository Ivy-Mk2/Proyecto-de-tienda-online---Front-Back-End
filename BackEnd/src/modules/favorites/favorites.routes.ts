import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';
import { asyncHandler } from '../../shared/utils/async-handler';
import { favoritesController } from './favorites.controller';

const router = Router();
const paramSchema = z.object({ params: z.object({ productId: z.string().min(1) }) });

router.use(requireAuth);
router.get('/', asyncHandler(favoritesController.list));
router.post('/:productId', validate(paramSchema), asyncHandler(favoritesController.add));
router.delete('/:productId', validate(paramSchema), asyncHandler(favoritesController.remove));

export { router as favoritesRoutes };
