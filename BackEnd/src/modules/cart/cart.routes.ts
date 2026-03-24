import { Router } from 'express';
import { requireAuth } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';
import { asyncHandler } from '../../shared/utils/async-handler';
import { cartController } from './cart.controller';
import {
  addItemSchema,
  cartQuerySchema,
  mergeCartSchema,
  removeItemSchema,
  updateItemSchema,
} from './cart.schema';

const router = Router();

router.get('/', validate(cartQuerySchema), asyncHandler(cartController.getCart));
router.post('/items', validate(addItemSchema), asyncHandler(cartController.addItem));
router.patch('/items/:itemId', validate(updateItemSchema), asyncHandler(cartController.updateItem));
router.delete(
  '/items/:itemId',
  validate(removeItemSchema),
  asyncHandler(cartController.removeItem),
);
router.post('/merge', requireAuth, validate(mergeCartSchema), asyncHandler(cartController.merge));

export { router as cartRoutes };
