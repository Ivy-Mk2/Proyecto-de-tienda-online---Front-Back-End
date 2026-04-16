import { Link } from 'react-router-dom';
import './Newsletter.css';

const Newsletter = () => {    
    return (
        <div className="newsletter">
          <h1>ÚNETE A NUESTRA COMUNIDAD Y RECIBE LAS ÚLTIMAS NOTICIAS</h1>
          <button className="custom-button" >
            REGISTRATE GRATIS
          </button>
          <button className="custom-button" >
            Simular error
          </button>
        </div>
    );
}

export default Newsletter;
