import { create } from 'zustand';
import type { CartItem } from '../domain';
import { cartService } from '../services/cart.service';

interface ShopState {
  cart: CartItem[];
  favorites: number[];
  addToCart: (productId: number, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  toggleFavorite: (productId: number) => void;
}

type SetState = (partial: Partial<ShopState> | ((state: ShopState) => Partial<ShopState>)) => void;

export const useShopStore = create<ShopState>((set: SetState) => ({
  cart: cartService.getCart(),
  favorites: [],
  addToCart: (productId: number, quantity = 1) =>
    set((state) => {
      const existingItem = state.cart.find((item: CartItem) => item.productId === productId);

      const updatedCart = existingItem
          ? state.cart.map((item: CartItem) =>
              item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item,
            )
        : [
            ...state.cart,
            {
              id: `${productId}`,
              productId,
              quantity,
            },
          ];

      cartService.saveCart(updatedCart);
      return { cart: updatedCart };
    }),

  removeFromCart: (productId: number) =>
    set((state) => {
      const updatedCart = state.cart.filter((item: CartItem) => item.productId !== productId);
      cartService.saveCart(updatedCart);
      return { cart: updatedCart };
    }),

  updateQuantity: (productId: number, quantity: number) =>
    set((state) => {
      const normalizedQuantity = Math.max(1, quantity);
      const updatedCart = state.cart.map((item: CartItem) =>
        item.productId === productId ? { ...item, quantity: normalizedQuantity } : item,
      );
      cartService.saveCart(updatedCart);
      return { cart: updatedCart };
    }),

  clearCart: () =>
    set(() => {
      cartService.clearCart();
      return { cart: [] };
    }),

  toggleFavorite: (productId: number) =>
    set((state) => {
      const isFavorite = state.favorites.includes(productId);
      return {
        favorites: isFavorite
          ? state.favorites.filter((id: number) => id !== productId)
          : [...state.favorites, productId],
      };
    }),
}));
