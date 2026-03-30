import './Header.css';
import Logo from './Logo';
import CartDropdown from './CartDropdown';
import User from './User';

const Header = () => {
  return (
    <div className="header">
      <Logo />
      <div className="header__user-container">
        <User />
        <CartDropdown />
      </div>
    </div>
  );
};

export default Header;
