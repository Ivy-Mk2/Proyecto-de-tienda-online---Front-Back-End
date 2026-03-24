import { Prisma } from '@prisma/client';
import { prisma } from '../../prisma/client';
import { AppError } from '../../shared/errors/app-error';

const cartInclude = {
  items: {
    include: {
      product: {
        include: { images: true },
      },
    },
  },
};

const getOrCreateCart = async (userId?: string, guestToken?: string) => {
  if (!userId && !guestToken) {
    throw new AppError(400, 'guestToken is required for guest carts');
  }

  const existing = await prisma.cart.findFirst({
    where: userId ? { userId } : { guestToken },
    include: cartInclude,
  });

  if (existing) return existing;

  return prisma.cart.create({
    data: { userId, guestToken },
    include: cartInclude,
  });
};

export const cartService = {
  async getCart(userId?: string, guestToken?: string) {
    return getOrCreateCart(userId, guestToken);
  },

  async addItem(params: {
    userId?: string;
    guestToken?: string;
    productId: string;
    quantity: number;
  }) {
    const cart = await getOrCreateCart(params.userId, params.guestToken);

    const product = await prisma.product.findUnique({ where: { id: params.productId } });
    if (!product || !product.isActive) throw new AppError(404, 'Product not found');

    if (product.stock < params.quantity) throw new AppError(400, 'Insufficient stock');

    const existing = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId: params.productId },
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + params.quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: params.productId,
          quantity: params.quantity,
          priceSnapshot: new Prisma.Decimal(product.price),
        },
      });
    }

    return prisma.cart.findUnique({ where: { id: cart.id }, include: cartInclude });
  },

  async updateItem(itemId: string, quantity: number, userId?: string) {
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });
    if (!item) throw new AppError(404, 'Cart item not found');

    if (userId && item.cart.userId && item.cart.userId !== userId) {
      throw new AppError(403, 'Forbidden');
    }

    await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });

    return prisma.cart.findUnique({ where: { id: item.cartId }, include: cartInclude });
  },

  async removeItem(itemId: string, userId?: string) {
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });
    if (!item) throw new AppError(404, 'Cart item not found');

    if (userId && item.cart.userId && item.cart.userId !== userId) {
      throw new AppError(403, 'Forbidden');
    }

    await prisma.cartItem.delete({ where: { id: itemId } });
    return prisma.cart.findUnique({ where: { id: item.cartId }, include: cartInclude });
  },

  async mergeGuestCart(userId: string, guestToken: string) {
    const userCart = await getOrCreateCart(userId, undefined);
    const guestCart = await prisma.cart.findUnique({
      where: { guestToken },
      include: { items: true },
    });

    if (!guestCart) return userCart;

    for (const guestItem of guestCart.items) {
      const existing = await prisma.cartItem.findFirst({
        where: { cartId: userCart.id, productId: guestItem.productId },
      });

      if (existing) {
        await prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + guestItem.quantity },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: userCart.id,
            productId: guestItem.productId,
            quantity: guestItem.quantity,
            priceSnapshot: guestItem.priceSnapshot,
          },
        });
      }
    }

    await prisma.cart.delete({ where: { id: guestCart.id } });
    return prisma.cart.findUnique({ where: { id: userCart.id }, include: cartInclude });
  },
};
