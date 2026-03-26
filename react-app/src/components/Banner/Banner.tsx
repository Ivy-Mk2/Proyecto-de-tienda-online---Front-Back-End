import React, { useState, useRef, useEffect } from 'react';
import { Link } from "react-router-dom";
import "./Banner.css";
import img0 from "../../Img/0.jpg";
import img1 from "../../Img/WhatsApp-Image-2019-06-11-at-18.04.17.jpg";
import img2 from "../../Img/ade9d580-d18c-4bad-a4b4-11f7e7f8f25d_skate-caps-web.jpg";
const images = [img0, img1, img2]; // Array de imágenes

const  Banner = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const totalImages = 3; // Número total de imágenes
   
    const handleNext = () => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % totalImages);
    };

    const handlePrev = () => {
        setActiveIndex((prevIndex) => (prevIndex - 1 + totalImages) % totalImages);
    };
    const toggleSelector = (index: number) => {
      setActiveIndex(index); // Cambia el ícono activo al índice actual
    }; 

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prevIndex) =>
                prevIndex === images.length - 1 ? 0 : prevIndex + 1
            );
        }, 5000); // Cambia la imagen cada 5 segundos

        return () => clearInterval(interval); // Limpia el intervalo cuando el componente se desmonta
    }, [images.length]);
      
    return(

        <>
            <section className="banner">
                <div className="banner__content">
                    <h2 className="banner__title">New <br/> Arrivals</h2>
                    <p className="banner__description">¡MIRA NUESTRA ÚLTIMA COLECCIÓN PRIMAVERA/VERANO 2024! TODA LA COLECCIÓN ESTÁ INSPIRADA EN LA MODA ASIÁTICA MODERNA Y EL ESTILO CALLEJERO AMERICANO ATEMPORAL.</p>
                    <Link to="/productos" className="banner__link">¡Muéstrame más!</Link>
                </div>
                <div className="banner__arrows">
                    <i className="banner__arrow-left fa-solid fa-arrow-left" onClick={handlePrev}></i>
                    <i className="banner__arrow-right fa-solid fa-arrow-right" onClick={handleNext}></i>
                </div>
                <div className="banner__selector">
                    {[0, 1, 2].map((index) => (
                        <i
                            key={index}
                            className={`fa-circle ${activeIndex === index ? 'fa-solid' : 'fa-regular'}`}
                            onClick={() => toggleSelector(index)}
                        ></i>
                    ))}
                </div>
                <div className="banner_images">
                    <div className="gradient-overlay"></div> 
                    {images.map((src, index) => (
                        <img
                            key={index}
                            src={src}
                            alt={`Banner ${index}`}
                            className={`banner__image ${
                                index === activeIndex
                                    ? "active"
                                    : index === (activeIndex === 0 ? images.length - 1 : activeIndex - 1)
                                    ? "previous"
                                    : ""
                            }`}
                        />
                    ))}
                </div>

            </section>
        </>
    );
}
export default Banner;