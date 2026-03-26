export interface CartItem {
  id: string;
  productId: number;
  quantity: number;
  size?: 'S' | 'M' | 'L' | 'XL';
  color?: string;
}
