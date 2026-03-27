import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHeaderData } from '../../hooks/useHeaderData';
import './Header.css';
import Logo from './Logo';
import CartDropdown from './CartDropdown';
import User from './User';

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
    <div className="header">
        <Logo />
        <div className="header__user-container">
          <User/>
        </div>

      {loading ? <p className="header__status">Sincronizando encabezado...</p> : null}
      {error ? <p className="header__status header__status--error">{error}</p> : null}
    </div>
  );
};

export default Header;
