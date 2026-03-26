import { useMemo } from 'react';
import { useShopStore } from '../store/useShopStore';
import { productsService } from '../services/products.service';
import type { CartItem, Product } from '../domain';

interface DetailedCartItem extends CartItem {
  product: Product;
  subtotal: number;
}

export const useCart = () => {
  const { cart, favorites, addToCart, removeFromCart, updateQuantity, clearCart, toggleFavorite } =
    useShopStore();

  const detailedCartItems = useMemo<DetailedCartItem[]>(
    () =>
      cart
        .map((item: CartItem) => {
          const product = productsService.getById(item.productId);
          if (!product) {
            return null;
          }

          return {
            ...item,
            product,
            subtotal: product.discountedPrice * item.quantity,
          };
        })
        .filter((item: DetailedCartItem | null): item is DetailedCartItem => item !== null),
    [cart],
  );

  const totals = useMemo(() => {
    const subtotal = detailedCartItems.reduce(
      (acc: number, item: DetailedCartItem) => acc + item.subtotal,
      0,
    );
    const shipping = subtotal > 0 ? 9.9 : 0;
    const total = subtotal + shipping;

    return { subtotal, shipping, total };
  }, [detailedCartItems]);

  return {
    cartItems: detailedCartItems,
    cartCount: cart.reduce((acc: number, item: CartItem) => acc + item.quantity, 0),
    favorites,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleFavorite,
    totals,
  };
};
