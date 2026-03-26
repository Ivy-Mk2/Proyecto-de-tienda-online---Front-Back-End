import React from "react";
import './SpecialBanner.css'
import Banner from "../../Img/0.jpg";
const SpecialBanner =() =>{ 
    const collectionTexts = Array(15).fill("Colección de verano"); // Un array con 15 elementos "Colección de verano"


    return(
        <>
            <div className="special-banner">
                <div className="special-banner__block special-banner__block--1">
                    <div className="special-banner__link-container"> 
                        {collectionTexts.map((text, index) => (
                            <span key={index}>{text}</span>
                        ))}
                    </div>
                    <div className="special-banner__image-container">
                        <img src={Banner} alt="Colección de caballeros" className="special-banner__image"/>
                    </div>
                </div>
                <div className="special-banner__block special-banner__block--2">
                    <div className="special-banner__link-container">
                        {collectionTexts.map((text, index) => (
                            <span key={index}>{text}</span>
                        ))}
                    </div>
                    <div className="special-banner__image-container">
                        <img src={Banner} alt="Colección de caballeros" className="special-banner__image"/>
                    </div>
                </div>
            </div>
        </>
    )
};
export default SpecialBanner;