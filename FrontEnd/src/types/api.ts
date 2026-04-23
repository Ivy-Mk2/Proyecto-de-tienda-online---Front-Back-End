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
  // refreshToken is now set as HttpOnly cookie by the server — not in the body
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

export type ShippingAddress = {
  fullName: string;
  phone: string;
  address: string;
  district: string;
  city: string;
  notes?: string;
};

export type Order = {
  id: string;
  total: string;
  paymentStatus: string;
  paymentProvider: string;
  shippingAddress?: ShippingAddress | null;
  createdAt: string;
  items: OrderItem[];
};

export type AdminOrderUser = { id: string; name: string; email: string };

export type AdminOrder = Order & { user: AdminOrderUser };

export type PaginatedOrders = {
  data: AdminOrder[];
  meta: { total: number; page: number; limit: number; pages: number };
};

export type ApiError = {
  status: number;
  message: string;
  issues?: unknown;
};


export type Banner = {
  id: string;
  title: string;
  subtitle?: string | null;
  label?: string | null;
  imageUrl: string;
  altText?: string | null;
  ctaText?: string | null;
  ctaLink?: string | null;
  isActive: boolean;
  orderIndex: number;
  order?: number | null;
  createdAt: string;
  updatedAt: string;
};


export type BodySection = {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
};
