import type { CartItem } from '../domain';

const CART_STORAGE_KEY = 'fashion-forward-cart';

const canUseStorage = () => typeof window !== 'undefined' && !!window.localStorage;

export const cartService = {
  getCart(): CartItem[] {
    if (!canUseStorage()) {
      return [];
    }

    try {
      const serializedCart = window.localStorage.getItem(CART_STORAGE_KEY);
      return serializedCart ? (JSON.parse(serializedCart) as CartItem[]) : [];
    } catch {
      return [];
    }
  },

  saveCart(cart: CartItem[]) {
    if (!canUseStorage()) {
      return;
    }

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  },

  clearCart() {
    if (!canUseStorage()) {
      return;
    }

    window.localStorage.removeItem(CART_STORAGE_KEY);
  },
};
