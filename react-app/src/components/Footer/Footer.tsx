import React from "react";
import FooterTop from "./FooterTop";
import FooterBottom from "./FooterBottom";
import './Footer.css';


function Footer (){
    return(
        <>
            <footer className="footer">
                <FooterTop/>
                <FooterBottom/>
            </footer>      
        </>
    );
}

export default Footer;