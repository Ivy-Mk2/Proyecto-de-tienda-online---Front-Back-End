import { Link } from 'react-router-dom';
import './Section.css';

const Section = () => {
  return (
    <>
      <div className="sale-banner">
        <div className="sale-banner__content">
          <h2 className="sale-banner__text"> FINAL DE TEMPORADA</h2>
          <p className="sale-banner__description">Hasta 40% OFF en temporadas pasadas</p>
          <Link to="/productos" className="sale-banner__button">
            COMPRAR AHORA
          </Link>
        </div>
      </div>
    </>
  );
};
export default Section;
