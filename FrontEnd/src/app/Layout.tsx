import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Layout = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <>
      <header className="topbar">
        <nav>
          <Link to="/">Productos</Link>
          <Link to="/cart">Carrito</Link>
          <Link to="/orders">Órdenes</Link>
          <Link to="/admin">Admin</Link>
        </nav>
        <div>
          {isAuthenticated ? (
            <>
              <span>{user?.email}</span>
              <button onClick={() => void logout()}>Salir</button>
            </>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </header>
      <Outlet />
    </>
  );
};
