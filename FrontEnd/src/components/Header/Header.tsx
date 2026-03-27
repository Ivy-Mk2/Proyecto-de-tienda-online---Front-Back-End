import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHeaderData } from '../../hooks/useHeaderData';
import './Header.css';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { cartCount, favoritesCount, categories, loading, error } = useHeaderData(isAuthenticated);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const onLogout = async () => {
    try {
      setLogoutLoading(true);
      await logout();
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <header className="header">
      <div className="header__row">
        <h1 className="header__logo">
          <Link to="/">Fashion Forward</Link>
        </h1>

        <nav className="header__nav" aria-label="Navegación principal">
          <Link to="/">Inicio</Link>
          <Link to="/">Productos</Link>
          {categories.map((category) => (
            <Link key={category} to={`/?category=${encodeURIComponent(category)}`}>
              {category}
            </Link>
          ))}
        </nav>

        <div className="header__actions">
          <Link to="/cart" className="header__chip">
            Carrito ({cartCount})
          </Link>

          {isAuthenticated ? <span className="header__chip">Favoritos ({favoritesCount})</span> : null}

          {isAuthenticated ? (
            <>
              <span className="header__user">{user?.name ?? user?.email}</span>
              <Link to="/orders" className="header__chip">
                Mis pedidos
              </Link>
              {user?.role === 'ADMIN' ? (
                <Link to="/admin" className="header__chip">
                  Admin
                </Link>
              ) : null}
              <button disabled={logoutLoading} onClick={() => void onLogout()}>
                {logoutLoading ? 'Saliendo...' : 'Salir'}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="header__chip">
                Ingresar
              </Link>
              <Link to="/register" className="header__chip">
                Registro
              </Link>
            </>
          )}
        </div>
      </div>

      {loading ? <p className="header__status">Sincronizando encabezado...</p> : null}
      {error ? <p className="header__status header__status--error">{error}</p> : null}
    </header>
  );
};

export default Header;
