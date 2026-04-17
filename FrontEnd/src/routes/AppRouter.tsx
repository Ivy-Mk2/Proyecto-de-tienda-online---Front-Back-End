import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from '../app/Layout';
import { AdminPage } from '../pages/AdminPage';
import { CartPage } from '../pages/CartPage';
import { ForbiddenPage } from '../pages/ForbiddenPage';
import { OrdersPage } from '../pages/OrdersPage';
import { ProductsPage } from '../pages/ProductsPage';
import { RegisterPage } from '../pages/RegisterPage';
import { RoleGuard, SessionGuard } from './guards';

const router = createBrowserRouter([
  { path: '/', element: <Layout /> },
  { path: '/productos', element: <ProductsPage /> },
  { path: '/cart', element: <CartPage /> },
  { path: '/forbidden', element: <ForbiddenPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    element: <SessionGuard />,
    children: [
      { path: '/orders', element: <OrdersPage /> },
      {
        element: <RoleGuard allowedRole="ADMIN" />,
        children: [{ path: '/admin', element: <AdminPage /> }],
      },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;
