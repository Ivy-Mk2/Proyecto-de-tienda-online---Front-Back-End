import { Router } from 'express';
import { authRoutes } from '../modules/auth/auth.routes';
import { bannersRoutes } from '../modules/banners/banners.routes';
import { cartRoutes } from '../modules/cart/cart.routes';
import { favoritesRoutes } from '../modules/favorites/favorites.routes';
import { ordersRoutes } from '../modules/orders/orders.routes';
import { productRoutes } from '../modules/products/product.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/favorites', favoritesRoutes);
router.use('/orders', ordersRoutes);
router.use('/banners', bannersRoutes);

export { router as v1Routes };
