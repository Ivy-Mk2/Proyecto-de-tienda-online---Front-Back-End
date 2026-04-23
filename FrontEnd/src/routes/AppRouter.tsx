import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from '../app/Layout';
import { AdminPage } from '../pages/AdminPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { FavoritesPage } from '../pages/FavoritesPage';
import { ForbiddenPage } from '../pages/ForbiddenPage';
import { HomePage } from '../pages/HomePage';
import { OrdersPage } from '../pages/OrdersPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { ProductsPage } from '../pages/ProductsPage';
import { RegisterPage } from '../pages/RegisterPage';
import { RoleGuard, SessionGuard } from './guards';

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/productos', element: <ProductsPage /> },
      { path: '/productos/:id', element: <ProductDetailPage /> },
      { path: '/cart', element: <CartPage /> },
      { path: '/forbidden', element: <ForbiddenPage /> },
      { path: '/register', element: <RegisterPage /> },
      {
        element: <SessionGuard />,
        children: [
          { path: '/orders', element: <OrdersPage /> },
          { path: '/checkout', element: <CheckoutPage /> },
          { path: '/favoritos', element: <FavoritesPage /> },
          {
            element: <RoleGuard allowedRole="ADMIN" />,
            children: [{ path: '/admin', element: <AdminPage /> }],
          },
        ],
      },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;
