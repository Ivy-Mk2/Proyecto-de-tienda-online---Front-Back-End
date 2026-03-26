import SideBar from "./Sidebar";
import Logo from "./Logo";
import User from "./User";
import CartDropdown from "./CartDropdown";
import './Header.css';
import './CartDropdown.css'


const Header =( )=>{
    return(
        <>
            <div className="header">
                <Logo/>
                <div className="header__user-container">
                    <User/>
                    <CartDropdown/>
                </div>
            </div>
        </>
    );
}
export default Header;