import { prisma } from '../../prisma/client';
import { AppError } from '../../shared/errors/app-error';

export const favoritesService = {
  async list(userId: string) {
    return prisma.favorite.findMany({
      where: { userId },
      include: { product: { include: { images: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  async add(userId: string, productId: string) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new AppError(404, 'Product not found');

    return prisma.favorite.upsert({
      where: { userId_productId: { userId, productId } },
      create: { userId, productId },
      update: {},
    });
  },

  async remove(userId: string, productId: string) {
    await prisma.favorite.deleteMany({ where: { userId, productId } });
  },
};
