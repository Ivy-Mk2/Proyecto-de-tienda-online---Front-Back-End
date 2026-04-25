import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import './Layout.css';

export const Layout = () => {
  const { pathname } = useLocation();
  const usesShell808 = ['/', '/productos', '/cart', '/favoritos', '/orders', '/checkout', '/register', '/login', '/admin', '/perfil'].some(
    (p) => pathname === p || pathname.startsWith('/productos/'),
  );
  return (
    <>
      {!usesShell808 && <Header />}
      <Outlet />
      {!usesShell808 && <Footer />}
    </>
  );
};
