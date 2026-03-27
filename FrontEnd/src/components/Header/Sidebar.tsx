import './Sidebar.css';
import useDropdown from "../Hooks/hooks";


const SideBar = () => {
    const { isActive, toggleDropdown, dropdownRef, dropdownRefIcon } = useDropdown<HTMLDivElement>();
    const menuOptions = [
        { name: 'Inicio', className: 'sidebar__item' },
        { name: 'All Products', className: 'sidebar__item' },
        { name: 'Polos', className: 'sidebar__item' },
        { name: 'Poleras', className: 'sidebar__item' },
        { name: 'Pantalones', className: 'sidebar__item' },
        { name: 'Zapatillas', className: 'sidebar__item' },
      ];
    return (
    <>
        <div className="SideBar">
            <div className="sideBar__button" onClick={toggleDropdown} ref={dropdownRefIcon}>
                <i className="header__icon fa-solid fa-bars"></i>
            </div>
            <div className="sideBar__container" >
                <div className={`sidebar ${isActive ? 'sidebar--active':''}`} ref={dropdownRef} >
                    <nav className="sidebar__nav">
                        <ul className="sidebar__list">
                             {menuOptions.map((option, index) => (
                                <li 
                                key={index} 
                                className={option.className}>
                                    {option.name}
                                </li>
                             ))}
                        </ul>                
                    </nav>                 

                </div>
            </div>
        </div>
    </>);

};
export default SideBar ;

