import React from 'react';
import productor1 from '../../Img/producto1.jpg';
import './BodySection.css';

const BodySection = () => {
    return (
        <>
        <div className="category-container">
            <div className="category">
                <div className="img-container">
                    <img src={productor1} alt="Para Él"/>
                </div>
                <span>Torso</span>
            </div>
            <div className="category">
                <div className="img-container">
                    <img src={productor1} alt="Para Él"/>
                </div>
                <span>Piernas</span>
            </div>
            <div className="category">
                <div className="img-container">
                    <img src={productor1} alt="Para Él"/>
                </div>
                <span>Pies</span>
            </div>
        </div>
        </>
        
    );
};

export default BodySection;