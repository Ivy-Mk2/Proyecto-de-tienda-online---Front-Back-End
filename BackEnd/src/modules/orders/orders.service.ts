import { PaymentStatus, Prisma } from '@prisma/client';
import { prisma } from '../../prisma/client';
import { AppError } from '../../shared/errors/app-error';

export const ordersService = {
  async checkout(userId: string) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) throw new AppError(400, 'Cart is empty');

    const total = cart.items.reduce(
      (acc, item) => acc.plus(new Prisma.Decimal(item.priceSnapshot).mul(item.quantity)),
      new Prisma.Decimal(0),
    );

    const order = await prisma.order.create({
      data: {
        userId,
        total,
        paymentProvider: 'SIMULATED',
        paymentStatus: PaymentStatus.PAID,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            productNameSnapshot: item.product.name,
            unitPriceSnapshot: item.priceSnapshot,
            quantity: item.quantity,
            subtotal: new Prisma.Decimal(item.priceSnapshot).mul(item.quantity),
          })),
        },
      },
      include: { items: true },
    });

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return order;
  },

  async list(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getById(userId: string, id: string) {
    const order = await prisma.order.findFirst({ where: { id, userId }, include: { items: true } });
    if (!order) throw new AppError(404, 'Order not found');
    return order;
  },
};
