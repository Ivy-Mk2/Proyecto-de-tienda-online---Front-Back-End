import { apiRequest } from '../lib/api/client';
import { tokens } from '../lib/api/tokens';
import { Cart } from '../types/api';

const CART_UPDATED_EVENT = 'cart:updated';

const notifyCartUpdated = () => {
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
};

export const cartService = {
  CART_UPDATED_EVENT,

  subscribeCartUpdates(listener: () => void) {
    window.addEventListener(CART_UPDATED_EVENT, listener);
    return () => window.removeEventListener(CART_UPDATED_EVENT, listener);
  },

  getCart(isAuthenticated: boolean) {
    if (isAuthenticated) return apiRequest<Cart>('/cart', { auth: true });

    const guestToken = tokens.getGuestToken();
    return apiRequest<Cart>(`/cart?guestToken=${guestToken}`);
  },

  async addItem(input: { productId: string; quantity: number; isAuthenticated: boolean }) {
    if (input.isAuthenticated) {
      const cart = await apiRequest<Cart>('/cart/items', {
        method: 'POST',
        auth: true,
        body: {
          productId: input.productId,
          quantity: input.quantity,
        },
      });
      notifyCartUpdated();
      return cart;
    }

    const cart = await apiRequest<Cart>('/cart/items', {
      method: 'POST',
      body: {
        productId: input.productId,
        quantity: input.quantity,
        guestToken: tokens.getGuestToken(),
      },
    });
    notifyCartUpdated();
    return cart;
  },

  async updateItem(input: {
    itemId: string;
    quantity: number;
    isAuthenticated: boolean;
  }) {
    if (input.isAuthenticated) {
      const cart = await apiRequest<Cart>(`/cart/items/${input.itemId}`, {
        method: 'PATCH',
        auth: true,
        body: { quantity: input.quantity },
      });
      notifyCartUpdated();
      return cart;
    }

    const cart = await apiRequest<Cart>(`/cart/items/${input.itemId}`, {
      method: 'PATCH',
      body: {
        quantity: input.quantity,
        guestToken: tokens.getGuestToken(),
      },
    });
    notifyCartUpdated();
    return cart;
  },

  async removeItem(input: { itemId: string; isAuthenticated: boolean }) {
    if (input.isAuthenticated) {
      const cart = await apiRequest<Cart>(`/cart/items/${input.itemId}`, {
        method: 'DELETE',
        auth: true,
      });
      notifyCartUpdated();
      return cart;
    }

    const guestToken = tokens.getGuestToken();
    const cart = await apiRequest<Cart>(`/cart/items/${input.itemId}?guestToken=${guestToken}`, {
      method: 'DELETE',
    });
    notifyCartUpdated();
    return cart;
  },

  async mergeGuestCart() {
    const cart = await apiRequest<Cart>('/cart/merge', {
      method: 'POST',
      auth: true,
      body: { guestToken: tokens.getGuestToken() },
    });
    notifyCartUpdated();
    return cart;
  },
};
