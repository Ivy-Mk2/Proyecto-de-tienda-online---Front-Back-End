import React, { useState } from "react";
import { Link } from "react-router-dom";
import useDropdown from "../Hooks/hooks";


const User = () => {
    const { isActive, toggleDropdown, dropdownRef, dropdownRefIcon } = useDropdown<HTMLDivElement>();

    return(
        <>
            <div className="user">
                <div className="header__icon" onClick={toggleDropdown} ref={dropdownRefIcon}>
                    <i className="fa-solid fa-user"></i>
                </div>
                <div className={`header__dropdown ${isActive ? 'header__dropdown--active':''}`} ref={dropdownRef}>
                    <form className="header__login-form">
                        <label htmlFor="username">Usuario:</label>
                        <input type="text" id="username" name="username" required/>
                        
                        <label htmlFor="password">Contraseña:</label>
                        <input type="password" id="password" name="password" required/>
                        
                        <button type="submit">Iniciar sesión</button>
                        <div className="login__options">
                            <ul>
                                <li className="login__options-facebook"><i className="fa-brands fa-facebook" style={{color: "#0e4ac5",}} ></i></li>
                                <li className="login__options-google"><i className="fa-brands fa-google" style={{color: "#34A853",}}></i></li>
                            </ul>
                        </div>
                    </form>
                    <div className="header__register-link">
                        <p>¿No eres usuario? <Link to="/registro" >Regístrate aquí</Link></p>
                    </div>
                </div>
            </div>
            
        </>);
};
export default User;