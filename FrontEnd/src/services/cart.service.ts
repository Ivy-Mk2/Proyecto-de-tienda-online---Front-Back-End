import { apiRequest } from '../lib/api/client';
import { tokens } from '../lib/api/tokens';
import { Cart } from '../types/api';

export const cartService = {
  getCart(isAuthenticated: boolean) {
    if (isAuthenticated) return apiRequest<Cart>('/cart', { auth: true });

    const guestToken = tokens.getGuestToken();
    return apiRequest<Cart>(`/cart?guestToken=${guestToken}`);
  },

  addItem(input: { productId: string; quantity: number; isAuthenticated: boolean }) {
    if (input.isAuthenticated) {
      return apiRequest<Cart>('/cart/items', {
        method: 'POST',
        auth: true,
        body: {
          productId: input.productId,
          quantity: input.quantity,
        },
      });
    }

    return apiRequest<Cart>('/cart/items', {
      method: 'POST',
      body: {
        productId: input.productId,
        quantity: input.quantity,
        guestToken: tokens.getGuestToken(),
      },
    });
  },

  updateItem(input: {
    itemId: string;
    quantity: number;
    isAuthenticated: boolean;
  }) {
    if (input.isAuthenticated) {
      return apiRequest<Cart>(`/cart/items/${input.itemId}`, {
        method: 'PATCH',
        auth: true,
        body: { quantity: input.quantity },
      });
    }

    return apiRequest<Cart>(`/cart/items/${input.itemId}`, {
      method: 'PATCH',
      body: {
        quantity: input.quantity,
        guestToken: tokens.getGuestToken(),
      },
    });
  },

  removeItem(input: { itemId: string; isAuthenticated: boolean }) {
    if (input.isAuthenticated) {
      return apiRequest<Cart>(`/cart/items/${input.itemId}`, {
        method: 'DELETE',
        auth: true,
      });
    }

    const guestToken = tokens.getGuestToken();
    return apiRequest<Cart>(`/cart/items/${input.itemId}?guestToken=${guestToken}`, {
      method: 'DELETE',
    });
  },

  mergeGuestCart() {
    return apiRequest<Cart>('/cart/merge', {
      method: 'POST',
      auth: true,
      body: { guestToken: tokens.getGuestToken() },
    });
  },
};
