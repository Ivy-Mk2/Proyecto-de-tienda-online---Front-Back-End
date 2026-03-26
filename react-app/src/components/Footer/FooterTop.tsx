import { Link } from "react-router-dom";
import React from "react";

const FooterTop = () => { 
    
    return(
        <>
            <div className="footer__top">
                    <div className="footer__logo">
                        <Link to="">Fashion Fordward</Link>
                    </div>
                    <div className="footer__nav">
                        <div className="footer__section">
                            <h4>Sobre Nosotros</h4>
                            <ul>
                                <li><Link to="" href="#">Nuestra empresa</Link></li>
                                <li><Link to="">Nuestra historia</Link></li>
                            </ul>
                        </div>
                        <div className="footer__section">
                            <h4>¿Necesitas ayuda?</h4>
                            <ul>
                                <li><Link to="">Contacto</Link></li>
                            </ul>
                        </div>
                        <div className="footer__section">
                            <h4>Legal</h4>
                            <ul>
                                <li><Link to="">Términos de uso</Link></li>
                                <li><Link to="">Política de Privacidad</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="footer__social">
                        <Link to=""><i className="fa fa-facebook"></i></Link>
                        <Link to=""><i className="fa fa-instagram"></i></Link>
                        <Link to=""><i className="fa fa-twitter"></i></Link>
                        <Link to=""><i className="fa fa-linkedin"></i></Link>
                    </div>
            </div>
        </>
    );

}

export default FooterTop;