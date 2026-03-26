export type UserRole = 'ADMIN' | 'CUSTOMER';

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  authProvider: string;
  createdAt: string;
};

export type AuthResponse = {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
};

export type ProductImage = {
  id: string;
  imageUrl: string;
  altText?: string | null;
  order: number;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: string;
  stock: number;
  category: string;
  sizes: string[];
  colors: string[];
  featured: boolean;
  isActive: boolean;
  images: ProductImage[];
};

export type CartItem = {
  id: string;
  quantity: number;
  productId: string;
  product: Product;
  priceSnapshot: string;
};

export type Cart = {
  id: string;
  userId?: string | null;
  guestToken?: string | null;
  items: CartItem[];
};

export type OrderItem = {
  id: string;
  productId: string;
  productNameSnapshot: string;
  unitPriceSnapshot: string;
  quantity: number;
  subtotal: string;
};

export type Order = {
  id: string;
  total: string;
  paymentStatus: string;
  paymentProvider: string;
  createdAt: string;
  items: OrderItem[];
};

export type ApiError = {
  status: number;
  message: string;
  issues?: unknown;
};
