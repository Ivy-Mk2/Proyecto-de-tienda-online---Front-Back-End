import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from '../app/Layout';
import { AdminPage } from '../pages/AdminPage';
import { CartPage } from '../pages/CartPage';
import { ForbiddenPage } from '../pages/ForbiddenPage';
import { LoginPage } from '../pages/LoginPage';
import { OrdersPage } from '../pages/OrdersPage';
import { ProductsPage } from '../pages/ProductsPage';
import { RegisterPage } from '../pages/RegisterPage';
import { RoleGuard, SessionGuard } from './guards';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <ProductsPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'forbidden', element: <ForbiddenPage /> },
      {
        element: <SessionGuard />,
        children: [
          { path: 'orders', element: <OrdersPage /> },
          {
            element: <RoleGuard allowedRole="ADMIN" />,
            children: [{ path: 'admin', element: <AdminPage /> }],
          },
        ],
      },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;
