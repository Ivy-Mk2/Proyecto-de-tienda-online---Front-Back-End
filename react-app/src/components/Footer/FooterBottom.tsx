import React from "react";
import { Link } from "react-router-dom";
const FooterBottom =()=>{
    
    return(
        <>
            <div className="footer__bottom">
                    <p>&copy; {new Date().getFullYear()} Fashion Fordward. Todos los derechos reservados.</p>
                    <div className="footer__location">
                        <Link to="#">Perú</Link>
                    </div>
            </div>
        </>
    );

}
export default FooterBottom;