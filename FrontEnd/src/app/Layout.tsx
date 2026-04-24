import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import './Layout.css';

export const Layout = () => {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  return (
    <>
      {!isHome && <Header />}
      <Outlet />
      {!isHome && <Footer />}
    </>
  );
};
